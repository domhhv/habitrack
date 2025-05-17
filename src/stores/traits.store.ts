import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';
import { toHashMap } from '@utils';

type TraitsState = {
  traits: Record<Trait['id'], Trait>;
  actions: {
    addTrait: (trait: TraitsInsert) => Promise<void>;
    clearTraits: () => void;
    fetchTraits: () => Promise<void>;
  };
};

const useTraitsStore = create<TraitsState>()(
  immer((set) => {
    return {
      traits: {},

      actions: {
        addTrait: async (trait: TraitsInsert) => {
          const newTrait = await createTrait(trait);

          set((state) => {
            state.traits[newTrait.id] = newTrait;
          });
        },

        clearTraits: () => {
          set((state) => {
            state.traits = {};
          });
        },

        fetchTraits: async () => {
          const traits = await listTraits();

          set((state) => {
            state.traits = toHashMap(traits);
          });
        },
      },
    };
  })
);

export const useTraits = () => {
  return useTraitsStore((state) => {
    return state.traits;
  });
};

export const useTraitActions = () => {
  return useTraitsStore((state) => {
    return state.actions;
  });
};
