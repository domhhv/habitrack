import {
  toZoned,
  parseAbsolute,
  getLocalTimeZone,
} from '@internationalized/date';
import keyBy from 'lodash.keyby';
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
  occurrences: Record<Occurrence['id'], Occurrence>;
  occurrencesActions: {
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<RawOccurrence>;
    clearOccurrences: () => void;
    fetchOccurrences: () => Promise<void>;
    removeOccurrence: (occurrence: Occurrence) => Promise<void>;
    setOccurrenceNote: (
      occurrenceId: Occurrence['id'],
      note: Pick<Note, 'id' | 'content'> | null
    ) => void;
    updateOccurrence: (
      id: Occurrence['id'],
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
      addOccurrence: async (occurrence: OccurrencesInsert) => {
        const nextOccurrence = await createOccurrence(occurrence);

        set((state) => {
          state.occurrences[nextOccurrence.id] =
            toClientOccurrence(nextOccurrence);
        });

        return nextOccurrence;
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

        const occurrencesWithZonedDateTime =
          occurrences.map(toClientOccurrence);

        set((state) => {
          state.occurrences = keyBy(occurrencesWithZonedDateTime, 'id');
        });
      },

      removeOccurrence: async ({ id, photoPaths }: Occurrence) => {
        await destroyOccurrence({ id, photoPaths });

        set((state) => {
          delete state.occurrences[id];
        });
      },

      setOccurrenceNote: (
        occurrenceId: Occurrence['id'],
        note: Pick<Note, 'id' | 'content'> | null
      ) => {
        set((state) => {
          const occurrence = state.occurrences[occurrenceId];

          if (!occurrence) {
            return;
          }

          occurrence.note = note;
        });
      },

      updateOccurrence: async (
        id: Occurrence['id'],
        body: OccurrencesUpdate
      ) => {
        const updatedOccurrence = await patchOccurrence(id, body);

        set((state) => {
          state.occurrences[id] = toClientOccurrence(updatedOccurrence);
        });
      },
    },
  };
};

export const useOccurrences = () => {
  return useBoundStore(
    useShallow((state) => {
      return Object.values(state.occurrences);
    })
  );
};

export const useOccurrenceActions = () => {
  return useBoundStore((state) => {
    return state.occurrencesActions;
  });
};
