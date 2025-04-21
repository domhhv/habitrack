import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';
import { create } from 'zustand';

type TraitsState = {
  traits: Trait[];
  actions: {
    fetchTraits: () => Promise<void>;
    clearTraits: () => void;
    addTrait: (trait: TraitsInsert) => Promise<void>;
  };
};

const useTraitsStore = create<TraitsState>((set) => {
  return {
    traits: [],

    actions: {
      clearTraits: () => {
        set({ traits: [] });
      },

      fetchTraits: async () => {
        const traits = await listTraits();
        set({ traits });
      },

      addTrait: async (trait: TraitsInsert) => {
        const newTrait = await createTrait(trait);
        set((state) => {
          return { traits: [...state.traits, newTrait] };
        });
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
