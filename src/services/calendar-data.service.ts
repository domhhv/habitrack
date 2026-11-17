import {
  now,
  toZoned,
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
  type ZonedDateTime,
} from '@internationalized/date';
import keyBy from 'lodash.keyby';

import type {
  Note,
  Habit,
  DaysOfWeek,
  Occurrence,
  RawOccurrence,
  TypedSupabaseClient,
  PendingCalendarWrites,
  OccurrenceValuesSubmission,
} from '@models';
import {
  isNoteOfPeriod,
  type CalendarRange,
  isNoteOfOccurrence,
  createCalendarRangeCache,
  getSiblingPrefetchRanges,
} from '@utils';

import { listNotes } from './notes.service';
import { listOccurrences } from './occurrences.service';

const occurrencesCache = createCalendarRangeCache<Occurrence[]>();
const notesCache = createCalendarRangeCache<Note[]>();

let knownFirstDayOfWeek: {
  userId: string | null;
  value: DaysOfWeek | undefined;
} | null = null;

const toClientOccurrence = (occurrence: RawOccurrence): Occurrence => {
  return {
    ...occurrence,
    createdAt: parseAbsolute(occurrence.createdAt, occurrence.timeZone),
    occurredAt: parseAbsolute(occurrence.occurredAt, occurrence.timeZone),
    updatedAt: occurrence.updatedAt
      ? parseAbsolute(occurrence.updatedAt, occurrence.timeZone)
      : null,
  };
};

const toZonedRange = ([rangeStart, rangeEnd]: CalendarRange) => {
  return [
    toZoned(rangeStart, getLocalTimeZone()),
    toZoned(rangeEnd, getLocalTimeZone()),
  ] as const;
};

const loadOccurrences = (
  supabase: TypedSupabaseClient,
  range: CalendarRange
) => {
  return occurrencesCache.load(range, async () => {
    const [rangeStart, rangeEnd] = toZonedRange(range);
    const occurrences = await listOccurrences(supabase, [rangeStart, rangeEnd]);

    return occurrences.map(toClientOccurrence);
  });
};

const loadNotes = (supabase: TypedSupabaseClient, range: CalendarRange) => {
  return notesCache.load(range, () => {
    const [rangeStart, rangeEnd] = toZonedRange(range);

    return listNotes(supabase, [rangeStart, rangeEnd]);
  });
};

const prefetchSiblingRanges = (
  supabase: TypedSupabaseClient,
  range: CalendarRange
) => {
  getSiblingPrefetchRanges(range).forEach((siblingRange) => {
    void Promise.all([
      loadOccurrences(supabase, siblingRange),
      loadNotes(supabase, siblingRange),
    ]).catch(() => {
      return undefined;
    });
  });
};

const buildOccurrencesByDate = (
  occurrences: Occurrence[],
  [rangeStart, rangeEnd]: CalendarRange
) => {
  const occurrencesByDate: Record<
    string,
    Record<Occurrence['id'], Occurrence>
  > = {};

  for (
    let date = toCalendarDate(rangeStart);
    date.compare(toCalendarDate(rangeEnd)) <= 0;
    date = date.add({ days: 1 })
  ) {
    occurrencesByDate[date.toString()] = {};
  }

  occurrences.forEach((occurrence) => {
    const dateKey = toCalendarDate(occurrence.occurredAt).toString();

    if (occurrencesByDate[dateKey]) {
      occurrencesByDate[dateKey][occurrence.id] = occurrence;
    }
  });

  return occurrencesByDate;
};

export const createCalendarData = (
  rangeOccurrences: Occurrence[],
  notes: Note[],
  range: CalendarRange
) => {
  const [rangeStart, rangeEnd] = toZonedRange(range);
  const occurrences = rangeOccurrences.filter(({ occurredAt }) => {
    return (
      occurredAt.compare(rangeStart) >= 0 && occurredAt.compare(rangeEnd) <= 0
    );
  });
  const periodNotes = notes.filter(isNoteOfPeriod);

  const notesOfKind = (kind: (typeof periodNotes)[number]['periodKind']) => {
    return periodNotes.filter(({ periodKind }) => {
      return periodKind === kind;
    });
  };

  return {
    dayNotes: notesOfKind('day'),
    monthNotes: notesOfKind('month'),
    occurrences,
    occurrencesByDate: buildOccurrencesByDate(occurrences, range),
    periodNotes,
    range,
    weekNotes: notesOfKind('week'),
    notesByOccurrenceId: keyBy(
      notes.filter(isNoteOfOccurrence),
      'occurrenceId'
    ),
  };
};

export type CalendarData = ReturnType<typeof createCalendarData>;

const toOccurrenceHabit = (habit: Habit): Occurrence['habit'] => {
  return {
    iconPath: habit.iconPath,
    metricDefinitions: habit.metricDefinitions,
    name: habit.name,
    trait:
      habit.trait && habit.traitId
        ? { ...habit.trait, id: habit.traitId }
        : null,
  };
};

const applyOccurrenceValues = (
  occurrence: Occurrence,
  values: OccurrenceValuesSubmission,
  photoPaths: string[],
  habits: Record<Habit['id'], Habit>
): Occurrence => {
  const habit = habits[values.selectedHabitId];
  const allPhotoPaths = [...(occurrence.photoPaths ?? []), ...photoPaths];

  return {
    ...occurrence,
    habit: habit ? toOccurrenceHabit(habit) : occurrence.habit,
    habitId: values.selectedHabitId,
    hasSpecificTime: values.hasSpecificTime,
    isPending: true,
    occurredAt: parseAbsolute(values.occurredAt, occurrence.timeZone),
    photoPaths: allPhotoPaths.length > 0 ? allPhotoPaths : null,
  };
};

const createPendingOccurrence = (
  id: string,
  values: OccurrenceValuesSubmission,
  photoPaths: string[],
  habits: Record<Habit['id'], Habit>
): Occurrence | null => {
  const habit = habits[values.selectedHabitId];
  const timeZone = getLocalTimeZone();

  if (!habit) {
    return null;
  }

  return applyOccurrenceValues(
    {
      cost: null,
      createdAt: now(timeZone),
      currency: null,
      habit: toOccurrenceHabit(habit),
      habitId: habit.id,
      hasSpecificTime: values.hasSpecificTime,
      id,
      metricValues: [],
      occurredAt: now(timeZone),
      photoPaths: null,
      stockUsages: [],
      timeZone,
      updatedAt: null,
      userId: habit.userId,
    },
    values,
    photoPaths,
    habits
  );
};

const getPendingNoteFields = () => {
  return { createdAt: new Date().toISOString(), updatedAt: null, userId: '' };
};

const applyPendingOccurrenceWrites = (
  occurrences: Occurrence[],
  writes: PendingCalendarWrites,
  habits: Record<Habit['id'], Habit>
) => {
  const deletedIds = new Set(writes.deletedOccurrenceIds);
  const updatesById = keyBy(writes.updatedOccurrences, 'occurrenceId');

  const nextOccurrences = occurrences
    .filter(({ id }) => {
      return !deletedIds.has(id);
    })
    .map((occurrence) => {
      const update = updatesById[occurrence.id];
      const removedMetricIds = new Set(
        writes.removedMetricValues
          .filter(({ occurrenceId }) => {
            return occurrenceId === occurrence.id;
          })
          .map(({ habitMetricId }) => {
            return habitMetricId;
          })
      );
      const updated = update
        ? applyOccurrenceValues(
            occurrence,
            update.values,
            update.photoPaths,
            habits
          )
        : occurrence;

      return removedMetricIds.size > 0
        ? {
            ...updated,
            metricValues: updated.metricValues.filter(({ habitMetricId }) => {
              return !removedMetricIds.has(habitMetricId);
            }),
          }
        : updated;
    });

  writes.createdOccurrences.forEach(({ id, photoPaths, values }) => {
    const occurrence = createPendingOccurrence(id, values, photoPaths, habits);

    if (occurrence) {
      nextOccurrences.push(occurrence);
    }
  });

  return nextOccurrences;
};

const applyPendingNoteWrites = (
  notes: Note[],
  writes: PendingCalendarWrites
) => {
  const deletedIds = new Set(writes.deletedNoteIds);
  const contentById = new Map(
    writes.updatedNotes.map(({ content, noteId }) => {
      return [noteId, content];
    })
  );
  const occurrenceNoteContent = new Map(
    [...writes.createdOccurrences, ...writes.updatedOccurrences].map(
      (write) => {
        return [
          'occurrenceId' in write ? write.occurrenceId : write.id,
          write.values.note.trim(),
        ];
      }
    )
  );

  const nextNotes: Note[] = notes.flatMap((note) => {
    if (deletedIds.has(note.id)) {
      return [];
    }

    const occurrenceId = isNoteOfOccurrence(note) ? note.occurrenceId : null;

    if (occurrenceId && occurrenceNoteContent.has(occurrenceId)) {
      const content = occurrenceNoteContent.get(occurrenceId);

      occurrenceNoteContent.delete(occurrenceId);

      return content ? [{ ...note, content }] : [];
    }

    const content = contentById.get(note.id);

    return [content === undefined ? note : { ...note, content }];
  });

  occurrenceNoteContent.forEach((content, occurrenceId) => {
    if (content) {
      nextNotes.push({
        ...getPendingNoteFields(),
        content,
        id: `pending-note-${occurrenceId}`,
        occurrenceId,
      });
    }
  });

  writes.createdNotes.forEach((note) => {
    nextNotes.push({ ...getPendingNoteFields(), ...note });
  });

  return nextNotes;
};

/**
 * Shows calendar writes that are still in flight: logged and edited entries, removed entries and
 * metric values, and day, week and month notes. A failed write drops out of the pending writes,
 * so the calendar falls back to the loaded data.
 */
export const applyPendingCalendarWrites = (
  data: CalendarData,
  writes: PendingCalendarWrites,
  habits: Record<Habit['id'], Habit>
): CalendarData => {
  return createCalendarData(
    applyPendingOccurrenceWrites(data.occurrences, writes, habits),
    applyPendingNoteWrites(
      [...data.periodNotes, ...Object.values(data.notesByOccurrenceId)],
      writes
    ),
    data.range
  );
};

export const loadCalendarData = async (
  supabase: TypedSupabaseClient,
  range: CalendarRange
) => {
  const currentRange = Promise.all([
    loadOccurrences(supabase, range),
    loadNotes(supabase, range),
  ]);

  prefetchSiblingRanges(supabase, range);

  const [occurrences, notes] = await currentRange;

  return createCalendarData(occurrences, notes, range);
};

export const invalidateCalendarOccurrences = () => {
  occurrencesCache.clear();
};

export const invalidateCalendarNotes = () => {
  notesCache.clear();
};

export const clearCalendarData = () => {
  occurrencesCache.clear();
  notesCache.clear();
};

let calendarDataUserId: string | null | undefined;

/**
 * Clears the caches when they were filled for another user. Server actions sign users in and out
 * without an auth event in the browser, so the calendar loader checks this on every load.
 */
export const claimCalendarData = (userId: string | null) => {
  if (calendarDataUserId !== undefined && calendarDataUserId !== userId) {
    clearCalendarData();
  }

  calendarDataUserId = userId;
};

/**
 * The app layout reports the signed-in user's first day of the week once its data loads, so the
 * calendar can work out later ranges in the browser without asking the server.
 */
export const rememberCalendarFirstDayOfWeek = (
  userId: string | null,
  firstDayOfWeek: DaysOfWeek | undefined
) => {
  knownFirstDayOfWeek = { userId, value: firstDayOfWeek };
};

export const getKnownFirstDayOfWeek = (userId: string | null) => {
  return knownFirstDayOfWeek?.userId === userId ? knownFirstDayOfWeek : null;
};

/**
 * Server-side load of a range's raw entries. The query reaches one day past each end of the
 * range in UTC, so it covers the range in every time zone, and the browser trims it to its own.
 */
export const loadCalendarEntries = async (
  supabase: TypedSupabaseClient,
  [rangeStart, rangeEnd]: CalendarRange
) => {
  const queryRange = [
    toZoned(rangeStart.subtract({ days: 1 }), 'UTC'),
    toZoned(rangeEnd.add({ days: 1 }), 'UTC'),
  ] as [ZonedDateTime, ZonedDateTime];
  const [occurrences, notes] = await Promise.all([
    listOccurrences(supabase, queryRange),
    listNotes(supabase, queryRange),
  ]);

  return { notes, occurrences };
};

export type CalendarEntries = Awaited<ReturnType<typeof loadCalendarEntries>>;

export const primeCalendarData = (
  range: CalendarRange,
  { notes, occurrences }: CalendarEntries
) => {
  occurrencesCache.prime(range, occurrences.map(toClientOccurrence));
  notesCache.prime(range, notes);
};
