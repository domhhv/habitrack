/**
 * Turns an untrusted redirect target, such as a `next` search param, into a path on the same
 * origin as the request. Anything pointing elsewhere falls back, which prevents open redirects.
 */
const getSafeRedirectPath = (
  target: string | null,
  requestUrl: string,
  fallback: string
) => {
  if (!target) {
    return fallback;
  }

  try {
    const { origin } = new URL(requestUrl);
    const url = new URL(target, origin);

    return url.origin === origin
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
};

export default getSafeRedirectPath;
