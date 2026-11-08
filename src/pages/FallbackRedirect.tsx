import React from 'react';
import { Navigate } from 'react-router';

import { getCalendarHref } from '@utils';

const FallbackRedirect = () => {
  return <Navigate replace to={getCalendarHref('month')} />;
};

export default FallbackRedirect;
