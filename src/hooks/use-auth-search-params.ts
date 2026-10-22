import { Toast } from '@heroui/react';
import React from 'react';
import { useFetcher, useLocation, useSearchParams } from 'react-router';

import { getSupabaseBrowserClient } from '@utils';

import useProfile from './use-profile';
import useUser from './use-user';

const useAuthSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const profile = useProfile();
  const user = useUser();
  const fetcher = useFetcher();

  const accessToken = hash?.split('access_token=')[1]?.split('&')[0];
  const refreshToken = hash?.split('refresh_token=')[1]?.split('&')[0];

  React.useEffect(() => {
    if (searchParams.get('emailConfirmed')) {
      getSupabaseBrowserClient()
        .auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(() => {
          Toast.toast.success(`Email confirmed! You're now logged in 🎉`);
        });
    }

    if (searchParams.get('passwordReset')) {
      getSupabaseBrowserClient()
        .auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(() => {
          Toast.toast.success(`You're now logged in to Habitrack`, {
            description: 'You can update your password on this page',
          });
        });
    }

    if (
      profile?.id &&
      user?.email &&
      searchParams.get('emailChangeConfirmed')
    ) {
      void fetcher.submit(
        { intent: 'sync-email' },
        { action: '/settings', method: 'post' }
      );
    }

    setSearchParams({});
  }, [searchParams, setSearchParams, profile?.id, profile?.email, user?.email]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAuthSearchParams;
