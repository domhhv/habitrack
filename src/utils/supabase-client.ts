import { createBrowserClient } from '@supabase/ssr';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { Database } from '@db-types';
import type { TypedSupabaseClient } from '@models';

import rollbar from './rollbar';

let legacySessionMigration: Promise<void> | null = null;

export const getSupabaseBrowserClient = (): TypedSupabaseClient => {
  if (process.env.NODE_ENV === 'test') {
    return {} as TypedSupabaseClient;
  }

  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
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
  const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
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
