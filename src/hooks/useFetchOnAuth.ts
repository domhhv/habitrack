import { supabaseClient } from '@helpers';
import { addToast } from '@heroui/react';
import {
  useTraitActions,
  useOccurrencesStore,
  useNoteActions,
  useHabitActions,
} from '@stores';
import { getErrorMessage } from '@utils';
import React from 'react';

const useFetchOnAuth = () => {
  const { fetchTraits, clearTraits } = useTraitActions();
  const { fetchHabits, clearHabits } = useHabitActions();
  const { fetchNotes, clearNotes } = useNoteActions();
  const { fetchOccurrences, clearOccurrences } = useOccurrencesStore();

  const fetchAllData = React.useCallback(async () => {
    try {
      await Promise.all([
        fetchTraits(),
        fetchHabits(),
        fetchOccurrences(),
        fetchNotes(),
      ]);
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while fetching your data.',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    }
  }, [fetchTraits, fetchHabits, fetchOccurrences, fetchNotes]);

  React.useEffect(() => {
    const { data } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearTraits();
        clearHabits();
        clearOccurrences();
        clearNotes();
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void fetchAllData();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchAllData, clearTraits, clearHabits, clearOccurrences, clearNotes]);
};

export default useFetchOnAuth;
