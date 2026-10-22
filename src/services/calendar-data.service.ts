import {
  toZoned,
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
  type ZonedDateTime,
} from '@internationalized/date';
import keyBy from 'lodash.keyby';

import type {
  Note,
  DaysOfWeek,
  Occurrence,
  RawOccurrence,
  TypedSupabaseClient,
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
    weekNotes: notesOfKind('week'),
    notesByOccurrenceId: keyBy(
      notes.filter(isNoteOfOccurrence),
      'occurrenceId'
    ),
  };
};

export type CalendarData = ReturnType<typeof createCalendarData>;

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
