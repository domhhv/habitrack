import { supabaseClient } from '@helpers';
import React from 'react';

type Args = {
  clear: () => void;
  load: () => Promise<void>;
};

const useDataFetch = ({ clear, load }: Args) => {
  React.useEffect(() => {
    if (!supabaseClient.auth) {
      return;
    }

    const { data } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clear();
      }

      if (['TOKEN_REFRESHED', 'SIGNED_IN'].includes(event)) {
        void load();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [clear, load]);
};

export default useDataFetch;
