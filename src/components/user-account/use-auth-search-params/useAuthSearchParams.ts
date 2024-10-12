import { useSnackbar } from '@context';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

const useAuthSearchParams = () => {
  const { showSnackbar } = useSnackbar();

  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('emailConfirmed')) {
      showSnackbar(`Email confirmed! You're now logged in 🎉`, {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    }

    if (searchParams.get('passwordReset')) {
      showSnackbar(`You're now logged in to Habitrack`, {
        description: 'You can update your password on this page',
        color: 'success',
        dismissible: true,
        dismissText: 'Dismiss',
      });
    }

    setSearchParams({});
  }, [showSnackbar, searchParams, setSearchParams]);
};

export default useAuthSearchParams;
