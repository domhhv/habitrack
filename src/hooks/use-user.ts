import type { User } from '@supabase/supabase-js';
import React from 'react';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { supabaseClient } from '@helpers';
import { deepCamelize } from '@utils';

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

  return { error, isLoading, user };
};

export default useUser;
