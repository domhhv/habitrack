import React from 'react';
import { Navigate, useLocation } from 'react-router';

const AccountRedirect = () => {
  const { hash, search } = useLocation();

  return <Navigate replace to={`/settings${search}${hash}`} />;
};

export default AccountRedirect;
