import { useTraitsStore } from '@stores';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import React from 'react';

const useFetchOnAuth = () => {
  const supabase = useSupabaseClient();
  const { fetchTraits, clearTraits } = useTraitsStore();

  React.useEffect(() => {
    if (!supabase.auth) {
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearTraits();
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void fetchTraits();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, fetchTraits, clearTraits]);
};

export default useFetchOnAuth;
