import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

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
import { toHashMap } from '@utils';

type OccurrencesState = {
  occurrences: Record<Occurrence['id'], Occurrence>;
  actions: {
    addOccurrence: (occurrence: OccurrencesInsert) => Promise<Occurrence>;
    clearOccurrences: () => void;
    fetchOccurrences: (range: [number, number]) => Promise<void>;
    removeOccurrence: (occurrence: Occurrence) => Promise<void>;
    setOccurrenceNote: (
      occurrenceId: Occurrence['id'],
      note: Pick<Note, 'id' | 'content'>
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

          set((state) => {
            state.occurrences = toHashMap(occurrences);
          });
        },

        removeOccurrence: async ({ id, photoPaths }: Occurrence) => {
          await destroyOccurrence(id);

          if (photoPaths) {
            await Promise.allSettled(
              photoPaths.map((photoPath) => {
                return deleteFile(StorageBuckets.OCCURRENCE_PHOTOS, photoPath);
              })
            );
          }

          set((state) => {
            delete state.occurrences[id];
          });
        },

        setOccurrenceNote: (
          occurrenceId: Occurrence['id'],
          note: Pick<Note, 'id' | 'content'>
        ) => {
          set((state) => {
            const occurrence = state.occurrences[occurrenceId];

            if (!occurrence) {
              return;
            }

            const noteIndex = occurrence.notes.findIndex((noteItem) => {
              return noteItem.id === note.id;
            });

            if (noteIndex === -1) {
              occurrence.notes.push(note);

              return;
            }

            occurrence.notes[noteIndex] = note;
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
