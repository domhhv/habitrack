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
  const fetchingTraits = useTraitsStore((state) => state.fetchingTraits);
  const { fetchHabits, fetchingHabits, clearHabits } = useHabitsStore();
  const { fetchOccurrences, fetchingOccurrences, clearOccurrences } =
    useOccurrencesStore();
  const { fetchNotes, fetchingNotes, clearNotes } = useNotesStore();
  const [hasFetched, setHasFetched] = React.useState(false);

  React.useEffect(() => {
    setHasFetched(
      !fetchingTraits &&
        !fetchingHabits &&
        !fetchingOccurrences &&
        !fetchingNotes
    );
  }, [fetchingTraits, fetchingHabits, fetchingOccurrences, fetchingNotes]);

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

  return { hasFetched };
};

export default useFetchOnAuth;
