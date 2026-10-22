import { Toast } from '@heroui/react';
import React from 'react';
import { useFetcher, useSearchParams } from 'react-router';

import useProfile from './use-profile';
import useUser from './use-user';

const SIGNED_OUT_LINK_DESCRIPTION =
  'Open the link in the browser you requested it from, or log in.';

const useAuthSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = useProfile();
  const user = useUser();
  const fetcher = useFetcher();

  React.useEffect(() => {
    if (searchParams.get('emailConfirmed')) {
      if (user) {
        Toast.toast.success(`Email confirmed! You're now logged in 🎉`);
      } else {
        Toast.toast.success('Email confirmed!', {
          description: SIGNED_OUT_LINK_DESCRIPTION,
        });
      }
    }

    if (searchParams.get('passwordReset')) {
      if (user) {
        Toast.toast.success(`You're now logged in to Habitrack`, {
          description: 'You can update your password on this page',
        });
      } else {
        Toast.toast.danger(`We couldn't sign you in with this link`, {
          description: SIGNED_OUT_LINK_DESCRIPTION,
        });
      }
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
