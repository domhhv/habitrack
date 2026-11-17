import { parseAbsolute, CalendarDateTime } from '@internationalized/date';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { PendingCalendarWrites } from '@models';
import { makeTestHabit, testSupabaseClient, makeTestOccurrence } from '@tests';
import type { CalendarRange } from '@utils';

import {
  loadCalendarData,
  claimCalendarData,
  clearCalendarData,
  primeCalendarData,
  createCalendarData,
  loadCalendarEntries,
  getKnownFirstDayOfWeek,
  applyPendingCalendarWrites,
  invalidateCalendarOccurrences,
  rememberCalendarFirstDayOfWeek,
} from './calendar-data.service';
import { listNotes } from './notes.service';
import { listOccurrences } from './occurrences.service';

vi.mock('./notes.service', () => {
  return { listNotes: vi.fn() };
});

vi.mock('./occurrences.service', () => {
  return { listOccurrences: vi.fn() };
});

const range: CalendarRange = [
  new CalendarDateTime(2026, 10, 19),
  new CalendarDateTime(2026, 10, 25, 23, 59, 59, 999),
];

const rawOccurrence = (id: string, occurredAt: string) => {
  return {
    createdAt: occurredAt,
    habitId: 'habit-1',
    id,
    occurredAt,
    timeZone: 'UTC',
    updatedAt: null,
  };
};

describe('createCalendarData', () => {
  it('groups notes by kind and occurrence, and occurrences by day', () => {
    const data = createCalendarData(
      [],
      [
        { id: 'day', periodDate: '2026-10-20', periodKind: 'day' },
        { id: 'week', periodDate: '2026-10-19', periodKind: 'week' },
        { id: 'occurrence-note', occurrenceId: 'occurrence-1' },
      ] as Parameters<typeof createCalendarData>[1],
      range
    );

    expect(
      data.dayNotes.map(({ id }) => {
        return id;
      })
    ).toEqual(['day']);
    expect(
      data.weekNotes.map(({ id }) => {
        return id;
      })
    ).toEqual(['week']);
    expect(data.monthNotes).toEqual([]);
    expect(Object.keys(data.notesByOccurrenceId)).toEqual(['occurrence-1']);
    expect(Object.keys(data.occurrencesByDate)).toHaveLength(7);
  });
});

describe('loadCalendarData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('TZ', 'UTC');
    clearCalendarData();
    vi.mocked(listNotes).mockResolvedValue([]);
    vi.mocked(listOccurrences).mockResolvedValue([
      rawOccurrence('inside', '2026-10-21T10:00:00Z'),
    ] as Awaited<ReturnType<typeof listOccurrences>>);
  });

  it('serves repeated loads of a range from the cache until it is invalidated', async () => {
    const first = await loadCalendarData(testSupabaseClient, range);

    expect(
      first.occurrences.map(({ id }) => {
        return id;
      })
    ).toEqual(['inside']);
    expect(listOccurrences).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.any(Array)
    );
    expect(listNotes).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.any(Array)
    );

    const callsAfterFirstLoad = vi.mocked(listOccurrences).mock.calls.length;

    await loadCalendarData(testSupabaseClient, range);

    expect(vi.mocked(listOccurrences).mock.calls.length).toBe(
      callsAfterFirstLoad
    );

    invalidateCalendarOccurrences();
    await loadCalendarData(testSupabaseClient, range);

    expect(vi.mocked(listOccurrences).mock.calls.length).toBeGreaterThan(
      callsAfterFirstLoad
    );
  });
  it('keeps the cache for the same user and clears it when the user changes', async () => {
    claimCalendarData('user-1');
    await loadCalendarData(testSupabaseClient, range);
    const callsAfterFirstLoad = vi.mocked(listOccurrences).mock.calls.length;

    claimCalendarData('user-1');
    await loadCalendarData(testSupabaseClient, range);

    expect(vi.mocked(listOccurrences).mock.calls.length).toBe(
      callsAfterFirstLoad
    );

    claimCalendarData('user-2');
    await loadCalendarData(testSupabaseClient, range);

    expect(vi.mocked(listOccurrences).mock.calls.length).toBeGreaterThan(
      callsAfterFirstLoad
    );
  });
});

describe('loadCalendarEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listNotes).mockResolvedValue([]);
    vi.mocked(listOccurrences).mockResolvedValue([]);
  });

  it('queries a day past each end of the range in UTC', async () => {
    await loadCalendarEntries(testSupabaseClient, range);

    const [, [queryStart, queryEnd]] = vi.mocked(listOccurrences).mock.calls[0];

    expect(queryStart.toAbsoluteString()).toBe('2026-10-18T00:00:00.000Z');
    expect(queryEnd.toAbsoluteString()).toBe('2026-10-26T23:59:59.999Z');
    expect(listNotes).toHaveBeenCalledWith(testSupabaseClient, [
      queryStart,
      queryEnd,
    ]);
  });
});

describe('primeCalendarData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('TZ', 'UTC');
    clearCalendarData();
    vi.mocked(listNotes).mockResolvedValue([]);
    vi.mocked(listOccurrences).mockResolvedValue([]);
  });

  it('serves loads inside a primed range from the cache', async () => {
    primeCalendarData(range, {
      notes: [],
      occurrences: [
        rawOccurrence('inside', '2026-10-21T10:00:00Z'),
        rawOccurrence('outside', '2026-10-26T10:00:00Z'),
      ] as Parameters<typeof primeCalendarData>[1]['occurrences'],
    });

    const data = await loadCalendarData(testSupabaseClient, [
      new CalendarDateTime(2026, 10, 20),
      new CalendarDateTime(2026, 10, 21, 23, 59, 59, 999),
    ]);

    expect(
      data.occurrences.map(({ id }) => {
        return id;
      })
    ).toEqual(['inside']);
    expect(
      vi.mocked(listOccurrences).mock.calls.map(([, [queryStart]]) => {
        return queryStart.toString();
      })
    ).not.toContainEqual(expect.stringContaining('2026-10-20'));
  });
});

describe('getKnownFirstDayOfWeek', () => {
  it('is known only for the user it was remembered for', () => {
    rememberCalendarFirstDayOfWeek('user-1', 'mon');

    expect(getKnownFirstDayOfWeek('user-1')).toEqual({
      userId: 'user-1',
      value: 'mon',
    });
    expect(getKnownFirstDayOfWeek('user-2')).toBeNull();
  });
});

describe('applyPendingCalendarWrites', () => {
  const writes: PendingCalendarWrites = {
    createdNotes: [],
    createdOccurrences: [],
    deletedNoteIds: [],
    deletedOccurrenceIds: [],
    removedMetricValues: [],
    updatedNotes: [],
    updatedOccurrences: [],
  };
  const values = {
    depletedStockIds: [],
    hasSpecificTime: true,
    metricValues: {},
    note: '',
    occurredAt: '2026-10-21T08:00:00.000Z',
    selectedHabitId: 'habit-1',
    stockUsages: [],
  };
  const habit = makeTestHabit({ id: 'habit-1', name: 'Run' });
  const habits = { [habit.id]: habit };

  const makeData = () => {
    return createCalendarData(
      [
        makeTestOccurrence({
          id: 'kept',
          occurredAt: parseAbsolute('2026-10-20T08:00:00.000Z', 'UTC'),
          timeZone: 'UTC',
          metricValues: [
            {
              createdAt: '2026-10-20T08:00:00.000Z',
              habitMetricId: 'metric-1',
              id: 'value-1',
              updatedAt: null,
              value: { numericValue: 1 },
            },
          ],
        }),
        makeTestOccurrence({
          id: 'deleted',
          occurredAt: parseAbsolute('2026-10-20T09:00:00.000Z', 'UTC'),
        }),
      ],
      [
        {
          content: 'Day',
          id: 'day',
          periodDate: '2026-10-20',
          periodKind: 'day',
        },
        {
          content: 'Gone',
          id: 'gone',
          periodDate: '2026-10-21',
          periodKind: 'day',
        },
        { content: 'Old', id: 'occurrence-note', occurrenceId: 'kept' },
      ] as Parameters<typeof createCalendarData>[1],
      range
    );
  };

  it('adds pending entries and hides pending deletions', () => {
    const data = applyPendingCalendarWrites(
      makeData(),
      {
        ...writes,
        deletedOccurrenceIds: ['deleted'],
        createdOccurrences: [
          {
            id: 'pending-1',
            photoPaths: [],
            values: { ...values, note: 'First run' },
          },
        ],
        removedMetricValues: [
          { habitMetricId: 'metric-1', occurrenceId: 'kept' },
        ],
      },
      habits
    );

    expect(Object.keys(data.occurrencesByDate['2026-10-20'])).toEqual(['kept']);
    expect(data.occurrencesByDate['2026-10-21']['pending-1']).toMatchObject({
      habit: { name: 'Run' },
      habitId: 'habit-1',
      isPending: true,
    });
    expect(data.occurrencesByDate['2026-10-20'].kept.metricValues).toEqual([]);
    expect(data.notesByOccurrenceId['pending-1']).toMatchObject({
      content: 'First run',
    });
  });

  it('skips a pending entry outside the range or for an unknown habit', () => {
    const data = applyPendingCalendarWrites(
      makeData(),
      {
        ...writes,
        createdOccurrences: [
          {
            id: 'outside',
            photoPaths: [],
            values: { ...values, occurredAt: '2026-11-02T08:00:00.000Z' },
          },
          {
            id: 'unknown',
            photoPaths: [],
            values: { ...values, selectedHabitId: 'habit-2' },
          },
        ],
      },
      habits
    );

    expect(
      data.occurrences.map(({ id }) => {
        return id;
      })
    ).toEqual(['kept', 'deleted']);
  });

  it('applies edited entries and their notes', () => {
    const data = applyPendingCalendarWrites(
      makeData(),
      {
        ...writes,
        updatedOccurrences: [
          {
            noteId: 'occurrence-note',
            occurrenceId: 'kept',
            photoPaths: ['new.jpg'],
            values: { ...values, hasSpecificTime: false, note: '' },
          },
        ],
      },
      habits
    );

    expect(data.occurrencesByDate['2026-10-21'].kept).toMatchObject({
      hasSpecificTime: false,
      isPending: true,
      photoPaths: ['new.jpg'],
    });
    expect(data.notesByOccurrenceId.kept).toBeUndefined();
  });

  it('adds, edits and hides day, week and month notes', () => {
    const data = applyPendingCalendarWrites(
      makeData(),
      {
        ...writes,
        deletedNoteIds: ['gone'],
        updatedNotes: [{ content: 'Edited day', noteId: 'day' }],
        createdNotes: [
          {
            content: 'New week',
            id: 'pending-week',
            periodDate: '2026-10-19',
            periodKind: 'week',
          },
        ],
      },
      habits
    );

    expect(
      data.dayNotes.map(({ content, id }) => {
        return { content, id };
      })
    ).toEqual([{ content: 'Edited day', id: 'day' }]);
    expect(data.weekNotes).toMatchObject([
      { content: 'New week', id: 'pending-week' },
    ]);
  });
});
