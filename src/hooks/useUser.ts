import { supabaseClient } from '@helpers';
import type { User, UserResponse } from '@supabase/supabase-js';
import React from 'react';

const useUser = () => {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<null | User>(null);

  React.useEffect(() => {
    supabaseClient.auth
      .getUser()
      .then((userResponse: UserResponse) => {
        if (userResponse.error) {
          throw new Error(userResponse.error.message);
        }

        setUser(user);
      })
      .catch((e) => {
        if (e.message !== 'Auth session missing!') {
          console.error('Error fetching user:', e);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  });

  return { loading, user };
};

export default useUser;
