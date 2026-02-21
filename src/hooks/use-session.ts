import { useRollbar } from '@rollbar/react';
import React from 'react';

import { getSession } from '@services';
import { useUser, useUserActions } from '@stores';
import { supabaseClient } from '@utils';

const useSession = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error>();
  const { user } = useUser();
  const { fetchProfile, setUser } = useUserActions();
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
    rollbar.configure({
      payload: {
        person: user
          ? {
              email: user.email,
              id: user.id,
            }
          : undefined,
      },
    });
  }, [rollbar, user]);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        ['TOKEN_REFRESHED', 'SIGNED_IN', 'USER_UPDATED'].includes(event)
      ) {
        const { email, id } = session.user;
        const fetchedAt = new Date().toISOString();

        fetchProfile(id).catch((err) => {
          rollbar.error('Failed to fetch profile', err);
        });
        setUser({
          email,
          fetchedAt,
          id,
        });
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, fetchProfile, rollbar]);

  return { error, isLoading };
};

export default useSession;
