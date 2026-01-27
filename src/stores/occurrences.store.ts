import {
  toZoned,
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
} from '@internationalized/date';
import { useShallow } from 'zustand/react/shallow';

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

import { useBoundStore, type SliceCreator } from './bound.store';

export type OccurrencesSlice = {
  occurrences: Occurrence[];
  occurrencesByDate: Record<string, Record<Occurrence['id'], Occurrence>>;
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

export const createOccurrencesSlice: SliceCreator<keyof OccurrencesSlice> = (
  set,
  getState
) => {
  return {
    occurrences: [],
    occurrencesByDate: {},

    occurrencesActions: {
      addOccurrence: async (occurrence) => {
        const nextOccurrence = await createOccurrence(occurrence);

        const clientOccurrence = toClientOccurrence(nextOccurrence);

        set((state) => {
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
        });

        return clientOccurrence;
      },

      clearOccurrences: () => {
        set((state) => {
          state.occurrences = [];
          state.occurrencesByDate = {};
        });
      },

      fetchOccurrences: async () => {
        const {
          calendarRange: [rangeStart, rangeEnd],
          user,
        } = getState();

        if (!user || rangeStart.compare(rangeEnd) === 0) {
          return;
        }

        const occurrences = await listOccurrences([
          toZoned(rangeStart, getLocalTimeZone()),
          toZoned(rangeEnd, getLocalTimeZone()),
        ]);

        const clientOccurrences = occurrences.map(toClientOccurrence);

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

        clientOccurrences.forEach((occurrence) => {
          const dateKey = toCalendarDate(occurrence.occurredAt).toString();

          if (occurrencesByDate[dateKey]) {
            occurrencesByDate[dateKey][occurrence.id] = occurrence;
          }
        });

        set((state) => {
          state.occurrences = clientOccurrences;
          state.occurrencesByDate = occurrencesByDate;
        });
      },

      removeOccurrence: async ({ id, occurredAt, photoPaths }) => {
        await destroyOccurrence({ id, photoPaths });

        set((state) => {
          delete state.occurrencesByDate[
            toCalendarDate(occurredAt).toString()
          ]?.[id];
          state.occurrences = state.occurrences.filter((occ) => {
            return occ.id !== id;
          });
        });
      },

      updateOccurrence: async ({ id, occurredAt }, body) => {
        const updatedOccurrence = await patchOccurrence(id, body);
        const updatedClientOccurrence = toClientOccurrence(updatedOccurrence);

        set((state) => {
          state.occurrences = state.occurrences.map((occurrence) => {
            return occurrence.id === id ? updatedClientOccurrence : occurrence;
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
        });
      },
    },
  };
};

export const useOccurrences = () => {
  return useBoundStore(
    useShallow((state) => {
      return state.occurrencesByDate;
    })
  );
};

export const useOccurrenceActions = () => {
  return useBoundStore((state) => {
    return state.occurrencesActions;
  });
};
