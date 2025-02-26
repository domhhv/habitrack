import { supabaseClient } from '@helpers';
import {
  useTraitsStore,
  useHabitsStore,
  useOccurrencesStore,
  useNotesStore,
} from '@stores';
import React from 'react';

const useFetchOnAuth = () => {
  const { fetchTraits, clearTraits } = useTraitsStore();
  const { fetchHabits, clearHabits } = useHabitsStore();
  const { fetchNotes, clearNotes } = useNotesStore();
  const { fetchOccurrences, clearOccurrences } = useOccurrencesStore();

  React.useEffect(() => {
    if (!supabaseClient.auth) {
      return;
    }

    const { data } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearTraits();
        clearHabits();
        clearOccurrences();
        clearNotes();
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void fetchTraits();
        void fetchHabits();
        void fetchOccurrences();
        void fetchNotes();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [
    fetchTraits,
    clearTraits,
    fetchHabits,
    clearHabits,
    fetchOccurrences,
    clearOccurrences,
    fetchNotes,
    clearNotes,
  ]);
};

export default useFetchOnAuth;
