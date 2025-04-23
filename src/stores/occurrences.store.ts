import { create } from 'zustand';

import type {
  Note,
  Occurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
} from '@models';
import { StorageBuckets } from '@models';
import {
  deleteFile,
  listOccurrences,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
} from '@services';

type OccurrencesState = {
  occurrences: Occurrence[];
  actions: {
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<Occurrence>;
    clearOccurrences: () => void;
    fetchOccurrences: (range: [number, number]) => Promise<void>;
    removeOccurrence: (occurrence: Occurrence) => Promise<void>;
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
      addOccurrence: async (occurrence: OccurrencesInsert) => {
        const nextOccurrence = await createOccurrence(occurrence);

        set((state) => {
          return {
            occurrences: [...state.occurrences, nextOccurrence],
          };
        });

        return nextOccurrence;
      },

      clearOccurrences: () => {
        set(() => {
          return { occurrences: [] };
        });
      },

      fetchOccurrences: async (range: [number, number]) => {
        const occurrences = await listOccurrences(range);
        set({ occurrences });
      },

      removeOccurrence: async ({ id, photoPaths }: Occurrence) => {
        await destroyOccurrence(id);

        if (photoPaths) {
          await Promise.all(
            photoPaths.map((photoPath) => {
              return deleteFile(StorageBuckets.OCCURRENCE_PHOTOS, photoPath);
            })
          );
        }

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
