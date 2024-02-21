import { useSnackbar } from '@context';
import React from 'react';
import { useLocation } from 'react-router-dom';

const useEmailConfirmed = () => {
  const { showSnackbar } = useSnackbar();

  const location = useLocation();

  React.useEffect(() => {
    const [, emailConfirmed] = location.search.split('=');

    if (emailConfirmed) {
      showSnackbar('Email confirmed', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    }
  }, [location, showSnackbar]);
};

export default useEmailConfirmed;
