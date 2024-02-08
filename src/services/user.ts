import type { Account } from '@context';
import type {
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { supabaseClient } from '@utils';

import { Collections, get, patch, type PatchEntity } from './supabase';

export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return supabaseClient.auth.signUp({
    email,
    password,
  });
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthTokenResponsePassword> => {
  return supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return supabaseClient.auth.signOut();
};

export const getUserAccount = async () => {
  return get<Account[]>(Collections.ACCOUNTS);
};

export const updateUserAccount = async (
  id: string,
  account: PatchEntity<Account>
) => {
  return patch(Collections.ACCOUNTS, id, account);
};
