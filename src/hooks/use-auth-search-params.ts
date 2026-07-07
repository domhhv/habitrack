import { Toast } from '@heroui/react';
import { useRollbar } from '@rollbar/react';
import React from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { useUser, useProfile, useUserActions } from '@stores';
import { supabaseClient, getErrorMessage } from '@utils';

const useAuthSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const profile = useProfile();
  const user = useUser();
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

    console.log('useAuthSearchParams, ', {
      profileEmail: profile?.email,
      userEmail: user?.email,
    });

    if (
      profile?.id &&
      user?.email &&
      searchParams.get('emailChangeConfirmed')
    ) {
      updateProfile(profile.id, { email: user.email })
        .then(() => {
          Toast.toast.success(`Your email change has been confirmed`, {
            description: `Your email has been set as ${user.email}`,
          });
        })
        .catch((error) => {
          Toast.toast.danger(`Something went wrong when updating your email`, {
            description: `Details: ${getErrorMessage(error)}`,
          });
          rollbar.error('Failed to update profile with new email', error);
        });
    }

    setSearchParams({});
  }, [searchParams, setSearchParams, profile?.id, profile?.email, user?.email]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAuthSearchParams;
