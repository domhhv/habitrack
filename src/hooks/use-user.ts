import { supabaseClient } from '@helpers';
import type { User } from '@supabase/supabase-js';
import { deepCamelize } from '@utils';
import React from 'react';
import type { CamelCasedPropertiesDeep } from 'type-fest';

const useUser = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<null | Error>(null);
  const [user, setUser] = React.useState<null | CamelCasedPropertiesDeep<User>>(
    null
  );

  React.useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (mounted) {
        if (error) {
          setError(error);
          setIsLoading(false);

          return;
        }

        setUser(session?.user ? deepCamelize(session.user) : null);
        setIsLoading(false);
      }
    };

    void getSession();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED')
      ) {
        setUser(deepCamelize(session.user));
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, error, user };
};

export default useUser;
