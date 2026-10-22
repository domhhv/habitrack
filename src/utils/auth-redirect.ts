import getSafeRedirectPath from './get-safe-redirect-path';

export const DEFAULT_SIGNED_IN_PATH = '/calendar';

export const getLoginPath = (requestUrl: string) => {
  const { pathname, search } = new URL(requestUrl);

  return `/login?${new URLSearchParams({ returnTo: `${pathname}${search}` })}`;
};

export const getReturnToPath = (requestUrl: string) => {
  return getSafeRedirectPath(
    new URL(requestUrl).searchParams.get('returnTo'),
    requestUrl,
    DEFAULT_SIGNED_IN_PATH
  );
};
