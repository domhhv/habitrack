import { createBrowserClient } from '@supabase/ssr';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { Database } from '@db-types';
import type { TypedSupabaseClient } from '@models';

import getErrorMessage from './get-error-message';
import rollbar from './rollbar';

let legacySessionMigration: Promise<void> | null = null;

export const getSupabaseBrowserClient = (): TypedSupabaseClient => {
  if (process.env.NODE_ENV === 'test') {
    return {} as TypedSupabaseClient;
  }

  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
};

const getLegacySessionKey = () => {
  return `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
};

const parseLegacySession = (storedSession: string) => {
  try {
    const { access_token = '', refresh_token = '' } = JSON.parse(storedSession);

    return {
      access_token: String(access_token),
      refresh_token: String(refresh_token),
    };
  } catch {
    return { access_token: '', refresh_token: '' };
  }
};

/**
 * Sessions used to live in localStorage under the same key the cookies use now.
 * Moves such a session into the cookies once, so nobody is signed out by the switch.
 * A network failure keeps the old entry for the next page load.
 */
const migrateLegacySession = async (supabase: TypedSupabaseClient) => {
  const storageKey = getLegacySessionKey();
  const storedSession = window.localStorage.getItem(storageKey);

  if (!storedSession) {
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { error } = session
    ? { error: null }
    : await supabase.auth.setSession(parseLegacySession(storedSession));

  if (!isAuthRetryableFetchError(error)) {
    window.localStorage.removeItem(storageKey);
  }
};

export const loadSupabaseBrowserClient = async () => {
  const supabase = getSupabaseBrowserClient();

  legacySessionMigration ??= migrateLegacySession(supabase).catch((error) => {
    rollbar.error(error);
  });

  await legacySessionMigration;

  return supabase;
};

/**
 * Whether this browser holds a session, for pages outside the app layout such as the landing page.
 * A localStorage session that could not be moved into the cookies yet still counts.
 */
export const hasBrowserSession = async () => {
  try {
    const supabase = await loadSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return (
      Boolean(session) ||
      window.localStorage.getItem(getLegacySessionKey()) !== null
    );
  } catch (error) {
    rollbar.error(
      error instanceof Error ? error : new Error(getErrorMessage(error))
    );

    return false;
  }
};
