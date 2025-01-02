import {
  useTraitsStore,
  useHabitsStore,
  useOccurrencesStore,
  useNotesStore,
} from '@stores';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import React from 'react';

const useFetchOnAuth = () => {
  const supabase = useSupabaseClient();
  const { fetchTraits, clearTraits } = useTraitsStore();
  const { fetchHabits, clearHabits } = useHabitsStore();
  const { fetchNotes, clearNotes } = useNotesStore();
  const { fetchOccurrences, clearOccurrences } = useOccurrencesStore();

  React.useEffect(() => {
    if (!supabase.auth) {
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
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
    supabase,
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
