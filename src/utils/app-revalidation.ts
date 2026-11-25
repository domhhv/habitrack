import type { ShouldRevalidateFunctionArgs } from 'react-router';

let writeVersion = 0;
let loadedVersion = 0;

/**
 * In framework mode, single fetch revalidates every loader on every navigation. The app layout's
 * data (profile, habits, traits) only changes through writes, so it reloads after a successful
 * submission until a load completes (which covers a navigation that interrupts that
 * revalidation), on `revalidate()` and same-URL navigations, but not on other navigations.
 */
export const shouldRevalidateAppData = ({
  currentUrl,
  defaultShouldRevalidate,
  formMethod,
  nextUrl,
}: ShouldRevalidateFunctionArgs) => {
  if (formMethod && formMethod.toUpperCase() !== 'GET') {
    if (defaultShouldRevalidate) {
      writeVersion += 1;
    }

    return defaultShouldRevalidate;
  }

  const isSameUrl =
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search === nextUrl.search;

  return (
    (isSameUrl || writeVersion !== loadedVersion) && defaultShouldRevalidate
  );
};

export const trackAppDataLoad = (signal: AbortSignal) => {
  const version = writeVersion;

  return () => {
    if (!signal.aborted) {
      loadedVersion = version;
    }
  };
};
