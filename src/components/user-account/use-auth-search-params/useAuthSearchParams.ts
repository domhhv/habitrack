import { supabaseClient } from '@helpers';
import { useSnackbarsStore } from '@stores';
import React from 'react';
import { useSearchParams, useLocation } from 'react-router';

const useAuthSearchParams = () => {
  const { showSnackbar } = useSnackbarsStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();

  const accessToken = hash?.split('access_token=')[1]?.split('&')[0];
  const refreshToken = hash?.split('refresh_token=')[1]?.split('&')[0];

  React.useEffect(() => {
    if (searchParams.get('emailConfirmed')) {
      supabaseClient.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(() => {
          showSnackbar(`Email confirmed! You're now logged in 🎉`, {
            color: 'success',
            dismissible: true,
            dismissText: 'Done',
          });
        });
    }

    if (searchParams.get('passwordReset')) {
      supabaseClient.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(() => {
          showSnackbar(`You're now logged in to Habitrack`, {
            description: 'You can update your password on this page',
            color: 'success',
            dismissible: true,
            dismissText: 'Dismiss',
          });
        });
    }

    setSearchParams({});
  }, [showSnackbar, searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAuthSearchParams;
