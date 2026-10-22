import { parseCookieHeader } from '@supabase/ssr';

const FALLBACK_LOCALE = 'en-US';
const FALLBACK_TIME_ZONE = 'UTC';

const isTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat(FALLBACK_LOCALE, { timeZone });

    return true;
  } catch {
    return false;
  }
};

/**
 * The visitor's time zone on the server, from the `tz` cookie that `rememberTimeZone` writes on
 * every page load. Falls back to UTC on a first visit.
 */
export const getRequestTimeZone = (request: Request) => {
  const timeZone = parseCookieHeader(request.headers.get('Cookie') ?? '').find(
    ({ name }) => {
      return name === 'tz';
    }
  )?.value;

  return timeZone && isTimeZone(timeZone) ? timeZone : FALLBACK_TIME_ZONE;
};

export const getRequestLocale = (request: Request) => {
  const [preferredLocale] = (request.headers.get('Accept-Language') ?? '')
    .split(',')
    .map((locale) => {
      return locale.split(';')[0].trim();
    });

  try {
    return new Intl.Locale(preferredLocale).toString();
  } catch {
    return FALLBACK_LOCALE;
  }
};
