import React from 'react';
import { Navigate } from 'react-router';

const FallbackRedirect = () => {
  return <Navigate replace to="/calendar/month" />;
};

export default FallbackRedirect;
