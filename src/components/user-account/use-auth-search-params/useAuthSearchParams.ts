import { supabaseClient } from '@helpers';
import { addToast } from '@heroui/react';
import React from 'react';
import { useSearchParams, useLocation } from 'react-router';

const useAuthSearchParams = () => {
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
          addToast({
            title: `Email confirmed! You're now logged in 🎉`,
            color: 'success',
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
          addToast({
            title: `You're now logged in to Habitrack`,
            description: 'You can update your password on this page',
            color: 'success',
          });
        });
    }

    setSearchParams({});
  }, [searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAuthSearchParams;
