import { CalendarDateTime } from '@internationalized/date';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { testSupabaseClient } from '@tests';
import type { CalendarRange } from '@utils';

import {
  loadCalendarData,
  clearCalendarData,
  primeCalendarData,
  createCalendarData,
  loadCalendarEntries,
  getKnownFirstDayOfWeek,
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
