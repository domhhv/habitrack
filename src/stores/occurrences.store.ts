import type { CalendarDateTime } from '@internationalized/date';
import {
  toZoned,
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
} from '@internationalized/date';

import type {
  Occurrence,
  RawOccurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
} from '@models';
import {
  listOccurrences,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
} from '@services';
import {
  type CalendarRange,
  createCalendarRangeCache,
  getSiblingPrefetchRanges,
} from '@utils';

import { useBoundStore, type SliceCreator } from './bound.store';

export type OccurrencesSlice = {
  occurrences: Occurrence[];
  occurrencesByDate: Record<string, Record<Occurrence['id'], Occurrence>>;
  occurrencesFetchedRange: [CalendarDateTime, CalendarDateTime] | null;
  occurrencesActions: {
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<Occurrence>;
    clearOccurrences: () => void;
    fetchOccurrences: () => Promise<void>;
    removeOccurrence: (occurrence: Occurrence) => Promise<void>;
    updateOccurrence: (
      occurrence: Occurrence,
      body: OccurrencesUpdate
    ) => Promise<void>;
  };
};

const toClientOccurrence = (occurrence: RawOccurrence) => {
  return {
    ...occurrence,
    createdAt: parseAbsolute(occurrence.createdAt, occurrence.timeZone),
    occurredAt: parseAbsolute(occurrence.occurredAt, occurrence.timeZone),
    updatedAt: occurrence.updatedAt
      ? parseAbsolute(occurrence.updatedAt, occurrence.timeZone)
      : null,
  };
};

const getOccurrencesInRange = (
  occurrences: Occurrence[],
  [rangeStart, rangeEnd]: CalendarRange
) => {
  const zonedStart = toZoned(rangeStart, getLocalTimeZone());
  const zonedEnd = toZoned(rangeEnd, getLocalTimeZone());

  return occurrences.filter((occurrence) => {
    return (
      occurrence.occurredAt.compare(zonedStart) >= 0 &&
      occurrence.occurredAt.compare(zonedEnd) <= 0
    );
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

  let currentDate = toCalendarDate(rangeStart);
  const endDate = toCalendarDate(rangeEnd);

  while (currentDate.compare(endDate) <= 0) {
    occurrencesByDate[currentDate.toString()] = {};
    currentDate = currentDate.add({ days: 1 });
  }

  occurrences.forEach((occurrence) => {
    const dateKey = toCalendarDate(occurrence.occurredAt).toString();

    if (occurrencesByDate[dateKey]) {
      occurrencesByDate[dateKey][occurrence.id] = occurrence;
    }
  });

  return occurrencesByDate;
};

export const createOccurrencesSlice: SliceCreator<keyof OccurrencesSlice> = (
  set,
  getState
) => {
  const cache = createCalendarRangeCache<Occurrence[]>();
  let cacheVersion = 0;

  const clearCache = () => {
    cache.clear();
    cacheVersion += 1;
  };

  const loadRange = (range: CalendarRange) => {
    return cache.load(range, async () => {
      const occurrences = await listOccurrences([
        toZoned(range[0], getLocalTimeZone()),
        toZoned(range[1], getLocalTimeZone()),
      ]);

      return occurrences.map(toClientOccurrence);
    });
  };

  const prefetchSiblingRanges = (range: CalendarRange) => {
    getSiblingPrefetchRanges(range).forEach((siblingRange) => {
      void loadRange(siblingRange).catch(() => {
        return undefined;
      });
    });
  };

  return {
    occurrences: [],
    occurrencesByDate: {},
    occurrencesFetchedRange: null,

    occurrencesActions: {
      addOccurrence: async (occurrence) => {
        const nextOccurrence = await createOccurrence(occurrence);

        const clientOccurrence = toClientOccurrence(nextOccurrence);

        clearCache();

        set(
          (state) => {
            state.occurrencesFetchedRange = null;
            state.occurrences.push(clientOccurrence);
            const dateKey = toCalendarDate(
              clientOccurrence.occurredAt
            ).toString();

            if (state.occurrencesByDate[dateKey]) {
              state.occurrencesByDate[dateKey][nextOccurrence.id] =
                clientOccurrence;
            } else {
              state.occurrencesByDate[dateKey] = {
                [nextOccurrence.id]: clientOccurrence,
              };
            }
          },
          undefined,
          'occurrencesActions.addOccurrence'
        );

        return clientOccurrence;
      },

      clearOccurrences: () => {
        clearCache();

        set(
          (state) => {
            state.occurrences = [];
            state.occurrencesByDate = {};
            state.occurrencesFetchedRange = null;
          },
          undefined,
          'occurrencesActions.clearOccurrences'
        );
      },

      fetchOccurrences: async () => {
        const {
          calendarRange: [rangeStart, rangeEnd],
          user,
        } = getState();

        if (!user || rangeStart.compare(rangeEnd) === 0) {
          return;
        }

        const range: CalendarRange = [rangeStart, rangeEnd];
        const cachedOccurrences = cache.get(range);
        const currentRequest = cachedOccurrences ? null : loadRange(range);

        prefetchSiblingRanges(range);

        if (cachedOccurrences) {
          const visibleOccurrences = getOccurrencesInRange(
            cachedOccurrences,
            range
          );
          const occurrencesByDate = buildOccurrencesByDate(
            visibleOccurrences,
            range
          );

          set(
            (state) => {
              state.occurrences = visibleOccurrences;
              state.occurrencesByDate = occurrencesByDate;
              state.occurrencesFetchedRange = range;
            },
            undefined,
            'occurrencesActions.fetchOccurrences.cacheHit'
          );

          return;
        }

        const requestVersion = cacheVersion;
        const clientOccurrences = await currentRequest!;
        const currentState = getState();

        if (
          requestVersion !== cacheVersion ||
          currentState.user?.id !== user.id ||
          currentState.calendarRange[0].compare(rangeStart) !== 0 ||
          currentState.calendarRange[1].compare(rangeEnd) !== 0
        ) {
          return;
        }

        const visibleOccurrences = getOccurrencesInRange(
          clientOccurrences,
          range
        );
        const occurrencesByDate = buildOccurrencesByDate(
          visibleOccurrences,
          range
        );

        set(
          (state) => {
            state.occurrences = visibleOccurrences;
            state.occurrencesByDate = occurrencesByDate;
            state.occurrencesFetchedRange = [rangeStart, rangeEnd];
          },
          undefined,
          'occurrencesActions.fetchOccurrences.cacheMiss'
        );
      },

      removeOccurrence: async ({ id, occurredAt, photoPaths }) => {
        await destroyOccurrence({ id, photoPaths });

        clearCache();

        set(
          (state) => {
            state.occurrencesFetchedRange = null;
            delete state.occurrencesByDate[
              toCalendarDate(occurredAt).toString()
            ]?.[id];
            state.occurrences = state.occurrences.filter((occ) => {
              return occ.id !== id;
            });
          },
          undefined,
          'occurrencesActions.removeOccurrence'
        );
      },

      updateOccurrence: async ({ id, occurredAt }, body) => {
        const updatedOccurrence = await patchOccurrence(id, body);
        const updatedClientOccurrence = toClientOccurrence(updatedOccurrence);

        clearCache();

        set(
          (state) => {
            state.occurrencesFetchedRange = null;
            state.occurrences = state.occurrences.map((occurrence) => {
              return occurrence.id === id
                ? updatedClientOccurrence
                : occurrence;
            });
            const prevDateKey = toCalendarDate(occurredAt).toString();
            const nextDateKey = toCalendarDate(
              updatedClientOccurrence.occurredAt
            ).toString();

            if (state.occurrencesByDate[prevDateKey]) {
              delete state.occurrencesByDate[prevDateKey][id];
            }

            if (!state.occurrencesByDate[nextDateKey]) {
              state.occurrencesByDate[nextDateKey] = {};
            }

            state.occurrencesByDate[nextDateKey][id] = updatedClientOccurrence;
          },
          undefined,
          'occurrencesActions.updateOccurrence'
        );
      },
    },
  };
};

export const useFlatOccurrences = () => {
  return useBoundStore((state) => {
    return state.occurrences;
  });
};

export const useOccurrences = () => {
  return useBoundStore((state) => {
    return state.occurrencesByDate;
  });
};

export const useOccurrenceActions = () => {
  return useBoundStore((state) => {
    return state.occurrencesActions;
  });
};
