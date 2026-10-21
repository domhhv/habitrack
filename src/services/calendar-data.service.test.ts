import { CalendarDateTime } from '@internationalized/date';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { CalendarRange } from '@utils';

import {
  loadCalendarData,
  clearCalendarData,
  createCalendarData,
  invalidateCalendarOccurrences,
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
    const first = await loadCalendarData(range);

    expect(
      first.occurrences.map(({ id }) => {
        return id;
      })
    ).toEqual(['inside']);

    const callsAfterFirstLoad = vi.mocked(listOccurrences).mock.calls.length;

    await loadCalendarData(range);

    expect(vi.mocked(listOccurrences).mock.calls.length).toBe(
      callsAfterFirstLoad
    );

    invalidateCalendarOccurrences();
    await loadCalendarData(range);

    expect(vi.mocked(listOccurrences).mock.calls.length).toBeGreaterThan(
      callsAfterFirstLoad
    );
  });
});
