import { addToast } from '@heroui/react';
import React from 'react';

import {
  useNoteActions,
  useTraitActions,
  useHabitActions,
  useOccurrenceActions,
} from '@stores';
import { supabaseClient, getErrorMessage } from '@utils';

const useFetchOnAuth = () => {
  const { clearOccurrences } = useOccurrenceActions();
  const { clearNotes } = useNoteActions();
  const { clearTraits, fetchTraits } = useTraitActions();
  const { clearHabits, fetchHabits } = useHabitActions();

  const fetchAllData = React.useCallback(async () => {
    try {
      await Promise.all([fetchTraits(), fetchHabits()]);
    } catch (error) {
      console.error(error);
      addToast({
        color: 'danger',
        description: `Error details: ${getErrorMessage(error)}`,
        title: 'Something went wrong while fetching your data.',
      });
    }
  }, [fetchTraits, fetchHabits]);

  React.useEffect(() => {
    const { data } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearTraits();
        clearHabits();
        clearNotes();
        clearOccurrences();
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void fetchAllData();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchAllData, clearTraits, clearHabits, clearNotes, clearOccurrences]);
};

export default useFetchOnAuth;
