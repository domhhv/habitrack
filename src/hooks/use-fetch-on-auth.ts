import { addToast } from '@heroui/react';
import React from 'react';

import { supabaseClient } from '@helpers';
import { useNoteActions, useTraitActions, useHabitActions } from '@stores';
import { getErrorMessage } from '@utils';

const useFetchOnAuth = () => {
  const { clearTraits, fetchTraits } = useTraitActions();
  const { clearHabits, fetchHabits } = useHabitActions();
  const { clearNotes, fetchNotes } = useNoteActions();

  const fetchAllData = React.useCallback(async () => {
    try {
      await Promise.all([fetchTraits(), fetchHabits(), fetchNotes()]);
    } catch (error) {
      console.error(error);
      addToast({
        color: 'danger',
        description: `Error details: ${getErrorMessage(error)}`,
        title: 'Something went wrong while fetching your data.',
      });
    }
  }, [fetchTraits, fetchHabits, fetchNotes]);

  React.useEffect(() => {
    const { data } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearTraits();
        clearHabits();
        clearNotes();
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void fetchAllData();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchAllData, clearTraits, clearHabits, clearNotes]);
};

export default useFetchOnAuth;
