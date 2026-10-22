import { createContext } from 'react-router';

import type { Profile, TypedSupabaseClient } from '@models';
import type { getSession } from '@services';

export type SessionUser = Awaited<ReturnType<typeof getSession>>;

export const supabaseContext = createContext<TypedSupabaseClient>();

export const userContext = createContext<SessionUser>(null);

/**
 * Loads the signed-in user's profile on the server at most once per request, and only when a
 * loader asks for it.
 */
export const profileContext = createContext<() => Promise<Profile | null>>(
  () => {
    return Promise.resolve(null);
  }
);
