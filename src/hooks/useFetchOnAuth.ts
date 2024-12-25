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
  const { fetchOccurrences, clearOccurrences } = useOccurrencesStore();
  const { fetchNotes, clearNotes } = useNotesStore();

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
    fetchNotes,
    clearHabits,
    fetchOccurrences,
    clearOccurrences,
    clearNotes,
  ]);
};

export default useFetchOnAuth;
