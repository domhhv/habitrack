import { CalendarDateTime } from '@internationalized/date';
import { it, vi, expect, describe } from 'vitest';

import {
  type CalendarRange,
  createCalendarRangeCache,
  getSiblingPrefetchRanges,
} from './calendar-range-cache';

const range = (startDay: number, endDay: number): CalendarRange => {
  return [
    new CalendarDateTime(2026, 1, startDay),
    new CalendarDateTime(2026, 1, endDay, 23, 59, 59, 999),
  ];
};

describe('createCalendarRangeCache', () => {
  it('returns an exact cached range', async () => {
    const cache = createCalendarRangeCache<string[]>();
    const loader = vi.fn().mockResolvedValue(['current']);

    await cache.load(range(5, 11), loader);

    expect(cache.get(range(5, 11))).toEqual(['current']);
    expect(loader).toHaveBeenCalledOnce();
  });

  it('returns a cached range that contains the requested range', async () => {
    const cache = createCalendarRangeCache<string[]>();
    const innerLoader = vi.fn().mockResolvedValue(['inner']);

    await cache.load(range(1, 20), async () => {
      return ['containing'];
    });

    expect(cache.get(range(5, 11))).toEqual(['containing']);
    await expect(cache.load(range(5, 11), innerLoader)).resolves.toEqual([
      'containing',
    ]);
    expect(innerLoader).not.toHaveBeenCalled();
  });

  it('prefers the most specific containing range', async () => {
    const cache = createCalendarRangeCache<string[]>();

    await cache.load(range(5, 11), async () => {
      return ['exact'];
    });
    await cache.load(range(1, 20), async () => {
      return ['large'];
    });

    expect(cache.get(range(5, 11))).toEqual(['exact']);
  });

  it('deduplicates requests for the same range', async () => {
    const cache = createCalendarRangeCache<string[]>();
    const loader = vi.fn().mockResolvedValue(['current']);

    const first = cache.load(range(5, 11), loader);
    const second = cache.load(range(5, 11), loader);

    await Promise.all([first, second]);

    expect(loader).toHaveBeenCalledOnce();
  });

  it('does not cache a request completed after the cache is cleared', async () => {
    const cache = createCalendarRangeCache<string[]>();
    let resolveRequest: ((value: string[]) => void) | undefined;
    const request = cache.load(range(5, 11), () => {
      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    });

    cache.clear();
    resolveRequest?.(['stale']);
    await request;

    expect(cache.get(range(5, 11))).toBeUndefined();
  });
});

describe('getSiblingPrefetchRanges', () => {
  it.each([
    { current: range(10, 10), days: 1 },
    { current: range(5, 11), days: 7 },
    { current: range(1, 31), days: 31 },
  ])('covers both sibling ranges for a $days-day view', ({ current, days }) => {
    const [previous, next] = getSiblingPrefetchRanges(current);
    const expectedPrevious: CalendarRange = [
      current[0].subtract({ days }),
      current[1].subtract({ days }),
    ];
    const expectedNext: CalendarRange = [
      current[0].add({ days }),
      current[1].add({ days }),
    ];

    expect(previous[0].compare(expectedPrevious[0])).toBeLessThanOrEqual(0);
    expect(previous[1].compare(expectedPrevious[1])).toBeGreaterThanOrEqual(0);
    expect(next[0].compare(expectedNext[0])).toBeLessThanOrEqual(0);
    expect(next[1].compare(expectedNext[1])).toBeGreaterThanOrEqual(0);
  });
});
