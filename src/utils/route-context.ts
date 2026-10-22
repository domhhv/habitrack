import { createContext } from 'react-router';

import type { Profile, TypedSupabaseClient } from '@models';
import type { getSession } from '@services';

export type SessionUser = Awaited<ReturnType<typeof getSession>>;

export const supabaseContext = createContext<TypedSupabaseClient>();

export const userContext = createContext<SessionUser>(null);

export const profileContext = createContext<Profile | null>(null);
