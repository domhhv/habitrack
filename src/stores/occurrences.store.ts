import type {
  Note,
  Occurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
} from '@models';
import {
  createOccurrence,
  destroyOccurrence,
  listOccurrences,
  patchOccurrence,
} from '@services';
import { create } from 'zustand';

type OccurrencesState = {
  occurrences: Occurrence[];
  actions: {
    fetchOccurrences: (range: [number, number]) => Promise<void>;
    clearOccurrences: () => void;
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<Occurrence>;
    removeOccurrence: (id: number) => Promise<void>;
    updateOccurrence: (id: number, body: OccurrencesUpdate) => Promise<void>;
    updateOccurrenceNoteInState: (
      occurrenceId: number,
      note: Pick<Note, 'id' | 'content'>
    ) => void;
  };
};

const useOccurrencesStore = create<OccurrencesState>((set) => {
  return {
    occurrences: [],

    actions: {
      clearOccurrences: () => {
        set(() => {
          return { occurrences: [] };
        });
      },

      fetchOccurrences: async (range: [number, number]) => {
        const occurrences = await listOccurrences(range);
        set({ occurrences });
      },

      addOccurrence: async (occurrence: OccurrencesInsert) => {
        const nextOccurrence = await createOccurrence(occurrence);

        set((state) => {
          return {
            occurrences: [...state.occurrences, nextOccurrence],
          };
        });

        return nextOccurrence;
      },

      removeOccurrence: async (id: number) => {
        await destroyOccurrence(id);
        set((state) => {
          return {
            occurrences: state.occurrences.filter((occurrence) => {
              return occurrence.id !== id;
            }),
          };
        });
      },

      updateOccurrence: async (id: number, body: OccurrencesUpdate) => {
        const updatedOccurrence = await patchOccurrence(id, body);
        set((state) => {
          return {
            occurrences: state.occurrences.map((occurrence) => {
              return occurrence.id === updatedOccurrence.id
                ? updatedOccurrence
                : occurrence;
            }),
          };
        });
      },

      updateOccurrenceNoteInState: (
        occurrenceId: number,
        note: Pick<Note, 'id' | 'content'>
      ) => {
        set((state) => {
          return {
            occurrences: state.occurrences.map((occurrence) => {
              return occurrence.id === occurrenceId
                ? {
                    ...occurrence,
                    notes: [note],
                  }
                : occurrence;
            }),
          };
        });
      },
    },
  };
});

export const useOccurrences = () => {
  return useOccurrencesStore((state) => {
    return state.occurrences;
  });
};

export const useOccurrenceActions = () => {
  return useOccurrencesStore((state) => {
    return state.actions;
  });
};
