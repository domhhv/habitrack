import { Toast } from '@heroui/react';
import { useRollbar } from '@rollbar/react';
import React from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { useProfile, useUserActions } from '@stores';
import { supabaseClient } from '@utils';

const useAuthSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const profile = useProfile();
  const { updateProfile } = useUserActions();
  const rollbar = useRollbar();

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
          Toast.toast.success(`Email confirmed! You're now logged in 🎉`);
        });
    }

    if (searchParams.get('passwordReset')) {
      supabaseClient.auth
        .setSession({
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
      searchParams.get('emailChangeConfirmed') &&
      searchParams.get('newEmail')
    ) {
      const newEmail = searchParams.get('newEmail');
      updateProfile(profile.id, { email: newEmail })
        .then(() => {
          Toast.toast.success(`Your email change has been confirmed`, {
            description: `Your email has been set as ${newEmail}`,
          });
        })
        .catch((err) => {
          rollbar.error('Failed to update profile with new email', err);
        });
    }

    setSearchParams({});
  }, [searchParams, setSearchParams, profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAuthSearchParams;
