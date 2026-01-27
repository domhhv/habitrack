import {
  toZoned,
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
} from '@internationalized/date';
import { useShallow } from 'zustand/react/shallow';

import type {
  Note,
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
  occurrences: Record<string, Record<Occurrence['id'], Occurrence>>;
  occurrencesActions: {
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<Occurrence>;
    clearOccurrences: () => void;
    fetchOccurrences: () => Promise<void>;
    removeOccurrence: (occurrence: Occurrence) => Promise<void>;
    setOccurrenceNote: (
      occurrence: Occurrence,
      note: Pick<Note, 'id' | 'content'> | null
    ) => void;
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
    occurrences: {},

    occurrencesActions: {
      addOccurrence: async (occurrence) => {
        const nextOccurrence = await createOccurrence(occurrence);

        const clientOccurrence = toClientOccurrence(nextOccurrence);

        set((state) => {
          const dateKey = occurrence.occurredAt.split('T')[0];

          if (state.occurrences[dateKey]) {
            state.occurrences[dateKey][nextOccurrence.id] = clientOccurrence;
          } else {
            state.occurrences[dateKey] = {
              [nextOccurrence.id]: clientOccurrence,
            };
          }
        });

        return clientOccurrence;
      },

      clearOccurrences: () => {
        set((state) => {
          state.occurrences = {};
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
          const occurredAt = parseAbsolute(
            occurrence.occurredAt,
            occurrence.timeZone
          );
          const dateKey = toCalendarDate(occurredAt).toString();

          if (occurrencesByDate[dateKey]) {
            occurrencesByDate[dateKey][occurrence.id] =
              toClientOccurrence(occurrence);
          }
        });

        set((state) => {
          state.occurrences = occurrencesByDate;
        });
      },

      removeOccurrence: async ({ id, occurredAt, photoPaths }) => {
        await destroyOccurrence({ id, photoPaths });

        set((state) => {
          delete state.occurrences[toCalendarDate(occurredAt).toString()]?.[id];
        });
      },

      setOccurrenceNote: ({ id, occurredAt }, note) => {
        set((state) => {
          const occurrence =
            state.occurrences[toCalendarDate(occurredAt).toString()]?.[id];

          if (!occurrence) {
            return;
          }

          occurrence.note = note;
        });
      },

      updateOccurrence: async ({ id, occurredAt }, body) => {
        const updatedOccurrence = await patchOccurrence(id, body);

        set((state) => {
          state.occurrences[toCalendarDate(occurredAt).toString()][id] =
            toClientOccurrence(updatedOccurrence);
        });
      },
    },
  };
};

export const useOccurrences = () => {
  return useBoundStore(
    useShallow((state) => {
      return state.occurrences;
    })
  );
};

export const useOccurrenceActions = () => {
  return useBoundStore((state) => {
    return state.occurrencesActions;
  });
};
