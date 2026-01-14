import {
  fromDate,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';
import keyBy from 'lodash.keyby';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

import type {
  Note,
  Occurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
} from '@models';
import {
  listOccurrences,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
} from '@services';

type OccurrencesState = {
  occurrences: Record<Occurrence['id'], Occurrence>;
  actions: {
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<Occurrence>;
    clearOccurrences: () => void;
    fetchOccurrences: (range: [number, number]) => Promise<void>;
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

const useOccurrencesStore = create<OccurrencesState>()(
  immer((set) => {
    return {
      occurrences: {},

      actions: {
        addOccurrence: async (occurrence: OccurrencesInsert) => {
          const nextOccurrence = await createOccurrence(occurrence);

          set((state) => {
            state.occurrences[nextOccurrence.id] = nextOccurrence;
          });

          return nextOccurrence;
        },

        clearOccurrences: () => {
          set((state) => {
            state.occurrences = {};
          });
        },

        fetchOccurrences: async (range: [number, number]) => {
          const occurrences = await listOccurrences(range);

          const occurrencesWithCalendarDateTime = occurrences.map(
            (occurrence) => {
              return {
                ...occurrence,
                occurredAt: toCalendarDateTime(
                  fromDate(new Date(occurrence.timestamp), getLocalTimeZone())
                ),
              };
            }
          );

          set((state) => {
            state.occurrences = keyBy(occurrencesWithCalendarDateTime, 'id');
          });
        },

        removeOccurrence: async (occurrence: Occurrence) => {
          await destroyOccurrence(occurrence);

          set((state) => {
            delete state.occurrences[occurrence.id];
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
            state.occurrences[id] = updatedOccurrence;
          });
        },
      },
    };
  })
);

export const useOccurrences = () => {
  return useOccurrencesStore(
    useShallow((state) => {
      return Object.values(state.occurrences);
    })
  );
};

export const useOccurrenceActions = () => {
  return useOccurrencesStore((state) => {
    return state.actions;
  });
};
