import camelcaseKeys from 'camelcase-keys';
import React from 'react';

import { getSession } from '@services';
import { useUserActions } from '@stores';
import { supabaseClient } from '@utils';

const useSession = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error>();
  const { setUser } = useUserActions();

  React.useEffect(() => {
    getSession()
      .then(setUser)
      .catch(setError)
      .finally(() => {
        setIsLoading(false);
      });
  }, [setUser]);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        [
          'INITIAL_SESSION',
          'TOKEN_REFRESHED',
          'SIGNED_IN',
          'USER_UPDATED',
        ].includes(event)
      ) {
        setUser(camelcaseKeys(session.user, { deep: true }));
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return { error, isLoading };
};

export default useSession;
