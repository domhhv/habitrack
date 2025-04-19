import { addToast } from '@heroui/react';
import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';
import { useOccurrencesStore } from '@stores';
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

type TraitsState = {
  traits: Trait[];
  fetchingTraits: boolean;
  addingTrait: boolean;
  fetchTraits: () => Promise<void>;
  addTrait: (trait: TraitsInsert) => Promise<void>;
  clearTraits: () => void;
};

const useTraitsStore = create<TraitsState>((set) => {
  return {
    traits: [],
    fetchingTraits: true,
    addingTrait: false,

    clearTraits: () => {
      set({ traits: [] });
    },

    fetchTraits: async () => {
      set({ fetchingTraits: true });
      const traits = await listTraits();
      const sortedUserTraits = traits
        .filter((trait) => {
          return !!trait.userId;
        })
        .sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      const allSortedTraits = traits
        .filter((trait) => {
          return !trait.userId;
        })
        .concat(sortedUserTraits);
      set({ traits: allSortedTraits });
      set({ fetchingTraits: false });
    },

    addTrait: async (trait: TraitsInsert) => {
      try {
        set({ addingTrait: true });
        const newTrait = await createTrait(trait);
        set((state) => {
          return { traits: [...state.traits, newTrait] };
        });
        addToast({
          title: 'Your habit trait has been added!',
          color: 'success',
        });
      } catch (error) {
        console.error(error);
        addToast({
          title:
            'Something went wrong while adding your habit trait. Please try again.',
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
        });
      } finally {
        set({ addingTrait: false });
      }
    },
  };
});

useTraitsStore.subscribe((state, prevState) => {
  const { updateFilteredBy } = useOccurrencesStore.getState();

  if (prevState.traits.length !== state.traits.length) {
    updateFilteredBy({
      traitIds: new Set(
        state.traits.map((trait) => {
          return trait.id.toString();
        })
      ),
    });
  }
});

export default useTraitsStore;
