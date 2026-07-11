import type { CalendarDateTime } from '@internationalized/date';

import { differenceInDays } from './date';

export type CalendarRange = [CalendarDateTime, CalendarDateTime];

type CacheEntry<T> = {
  range: CalendarRange;
  value: T;
};

const containsRange = (
  [outerStart, outerEnd]: CalendarRange,
  [innerStart, innerEnd]: CalendarRange
) => {
  return outerStart.compare(innerStart) <= 0 && outerEnd.compare(innerEnd) >= 0;
};

const isSameRange = (
  [firstStart, firstEnd]: CalendarRange,
  [secondStart, secondEnd]: CalendarRange
) => {
  return (
    firstStart.compare(secondStart) === 0 && firstEnd.compare(secondEnd) === 0
  );
};

const getRangeKey = ([rangeStart, rangeEnd]: CalendarRange) => {
  return `${rangeStart.toString()}_${rangeEnd.toString()}`;
};

export const getSiblingPrefetchRanges = ([
  rangeStart,
  rangeEnd,
]: CalendarRange): [CalendarRange, CalendarRange] => {
  const rangeDays = Math.max(1, differenceInDays(rangeStart, rangeEnd) + 1);

  return [
    [rangeStart.subtract({ days: rangeDays }), rangeEnd],
    [rangeStart, rangeEnd.add({ days: rangeDays })],
  ];
};

export const createCalendarRangeCache = <T>() => {
  let entries: CacheEntry<T>[] = [];
  let generation = 0;
  const pending = new Map<string, Promise<T>>();

  const get = (range: CalendarRange) => {
    const matches = entries.filter((entry) => {
      return containsRange(entry.range, range);
    });

    return matches.reduce<CacheEntry<T> | undefined>((closest, entry) => {
      if (!closest || containsRange(closest.range, entry.range)) {
        return entry;
      }

      return closest;
    }, undefined)?.value;
  };

  const load = (range: CalendarRange, loader: () => Promise<T>) => {
    const cached = get(range);

    if (cached !== undefined) {
      return Promise.resolve(cached);
    }

    const key = getRangeKey(range);
    const existingRequest = pending.get(key);

    if (existingRequest) {
      return existingRequest;
    }

    const requestGeneration = generation;
    const request = loader().then((value) => {
      if (requestGeneration === generation) {
        entries = entries.filter((entry) => {
          return !isSameRange(entry.range, range);
        });
        entries.push({ range, value });
      }

      return value;
    });

    pending.set(key, request);

    const cleanUpRequest = () => {
      if (pending.get(key) === request) {
        pending.delete(key);
      }
    };

    void request.then(cleanUpRequest, cleanUpRequest);

    return request;
  };

  return {
    get,
    load,
    clear: () => {
      entries = [];
      generation += 1;
      pending.clear();
    },
    values: () => {
      return entries.map((entry) => {
        return entry.value;
      });
    },
  };
};
