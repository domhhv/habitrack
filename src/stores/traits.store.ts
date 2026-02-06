import keyBy from 'lodash.keyby';

import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type TraitsSlice = {
  traits: Record<Trait['id'], Trait>;
  traitActions: {
    addTrait: (trait: TraitsInsert) => Promise<void>;
    clearTraits: () => void;
    fetchTraits: () => Promise<void>;
  };
};

export const createTraitsSlice: SliceCreator<keyof TraitsSlice> = (set) => {
  return {
    traits: {},

    traitActions: {
      addTrait: async (trait: TraitsInsert) => {
        const newTrait = await createTrait(trait);

        set((state) => {
          state.traits[newTrait.id] = newTrait;
          state.calendarFilters.traitIds.push(newTrait.id);
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
          const prevTraitIds = state.calendarFilters.traitIds;
          const nextTraitIds = traits.map((trait) => {
            return trait.id;
          });

          state.traits = keyBy(traits, 'id');

          state.calendarFilters.traitIds =
            prevTraitIds.length === 0
              ? nextTraitIds
              : prevTraitIds.filter((id) => {
                  return nextTraitIds.includes(id);
                });
        });
      },
    },
  };
};

export const useTraits = () => {
  return useBoundStore((state) => {
    return state.traits;
  });
};

export const useTraitActions = () => {
  return useBoundStore((state) => {
    return state.traitActions;
  });
};
