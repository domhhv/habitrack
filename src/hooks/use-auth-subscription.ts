import { useRollbar } from '@rollbar/react';
import React from 'react';
import { useRevalidator } from 'react-router';

import { supabaseClient, markAppDataStale, type SessionUser } from '@utils';

const useAuthSubscription = (user: SessionUser) => {
  const { revalidate } = useRevalidator();
  const rollbar = useRollbar();
  const userId = user?.id ?? null;

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
      const hasUserChanged = (session?.user.id ?? null) !== userId;

      if (hasUserChanged || event === 'USER_UPDATED') {
        markAppDataStale();
        void revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [revalidate, userId]);
};

export default useAuthSubscription;
