import { Toast } from '@heroui/react';
import React from 'react';
import { href, useSearchParams } from 'react-router';

import useActionFetcher from './use-action-fetcher';
import useProfile from './use-profile';
import useUser from './use-user';

const useAuthSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = useProfile();
  const user = useUser();
  const fetcher = useActionFetcher();

  React.useEffect(() => {
    if (searchParams.size === 0) {
      return;
    }

    if (searchParams.get('emailConfirmed')) {
      Toast.toast.success(`Email confirmed! You're now logged in 🎉`);
    }

    if (searchParams.get('passwordReset')) {
      Toast.toast.success(`You're now logged in to Habitrack`, {
        description: 'You can update your password on this page',
      });
    }

    if (
      profile?.id &&
      user?.email &&
      searchParams.get('emailChangeConfirmed')
    ) {
      void fetcher.submit(
        { intent: 'sync-email' },
        { action: href('/settings'), method: 'post' }
      );
    }

    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, profile?.id, profile?.email, user?.email]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAuthSearchParams;
