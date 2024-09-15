import { useSupabaseClient } from '@supabase/auth-helpers-react';
import React from 'react';

type Args = {
  clear: () => void;
  load: () => Promise<void>;
};

const useDataFetch = ({ clear, load }: Args) => {
  const supabase = useSupabaseClient();

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clear();
      }

      if (['INITIAL_SESSION', 'TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void load();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, clear, load]);
};

export default useDataFetch;