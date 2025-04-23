import { create } from 'zustand';

import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';

type TraitsState = {
  traits: Trait[];
  actions: {
    addTrait: (trait: TraitsInsert) => Promise<void>;
    clearTraits: () => void;
    fetchTraits: () => Promise<void>;
  };
};

const useTraitsStore = create<TraitsState>((set) => {
  return {
    traits: [],

    actions: {
      addTrait: async (trait: TraitsInsert) => {
        const newTrait = await createTrait(trait);
        set((state) => {
          return { traits: [...state.traits, newTrait] };
        });
      },

      clearTraits: () => {
        set({ traits: [] });
      },

      fetchTraits: async () => {
        const traits = await listTraits();
        set({ traits });
      },
    },
  };
});

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
