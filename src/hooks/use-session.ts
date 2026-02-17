import { useRollbar } from '@rollbar/react';
import camelcaseKeys from 'camelcase-keys';
import React from 'react';

import { getSession } from '@services';
import { useUserActions } from '@stores';
import { supabaseClient } from '@utils';

const useSession = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error>();
  const { setUser } = useUserActions();
  const rollbar = useRollbar();

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
        const { email, id, ...camelizedUser } = camelcaseKeys(session.user, {
          deep: true,
        });
        const fetchedAt = new Date().toISOString();

        setUser({
          ...camelizedUser,
          email,
          fetchedAt,
          id,
        });

        rollbar.configure({
          payload: {
            person: {
              email,
              id,
            },
          },
        });
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        rollbar.configure({
          payload: {
            person: undefined,
          },
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, rollbar]);

  return { error, isLoading };
};

export default useSession;
