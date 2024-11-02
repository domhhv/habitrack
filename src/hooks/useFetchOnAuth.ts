import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { useHabitsStore, useOccurrencesStore, useTraitsStore } from '@stores';

const useFetchOnAuth = () => {
  const supabase = useSupabaseClient();
  const { fetchTraits, clearTraits } = useTraitsStore();
  const { fetchHabits, clearHabits } = useHabitsStore();
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
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void fetchTraits();
        void fetchHabits();
        void fetchOccurrences();
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
  ]);
};

export default useFetchOnAuth;
