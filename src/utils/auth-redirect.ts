import { href } from 'react-router';

import getCalendarHref from './calendar-href';
import getSafeRedirectPath from './get-safe-redirect-path';

export const DEFAULT_SIGNED_IN_PATH = getCalendarHref('month');

export const getLoginPath = (requestUrl: string) => {
  const { pathname, search } = new URL(requestUrl);

  return `${href('/login')}?${new URLSearchParams({ returnTo: `${pathname}${search}` })}`;
};

export const getReturnToPath = (requestUrl: string) => {
  return getSafeRedirectPath(
    new URL(requestUrl).searchParams.get('returnTo'),
    requestUrl,
    DEFAULT_SIGNED_IN_PATH
  );
};
