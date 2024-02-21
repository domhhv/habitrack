import { useSnackbar } from '@context';
import React from 'react';
import { useLocation } from 'react-router-dom';

const useEmailConfirmed = (email: string) => {
  const { showSnackbar } = useSnackbar();

  const location = useLocation();

  React.useEffect(() => {
    const [, emailConfirmed] = location.search.split('=');

    if (email && emailConfirmed) {
      showSnackbar('Email confirmed', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    }
  }, [email, location, showSnackbar]);
};

export default useEmailConfirmed;
