import { supabaseClient } from '@helpers';
import { type ServerAccount } from '@models';
import type {
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { transformServerEntity } from '@utils';

import { Collections, getByField, patch, type PatchEntity } from './supabase';

export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account?emailConfirmed=true`,
    },
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

export const updateUserPassword = async (password: string) => {
  return supabaseClient.auth.updateUser({
    password,
  });
};

export const getUserAccountByEmail = async (supabaseUserEmail: string) => {
  const [serverAccount] = await getByField<ServerAccount>(
    Collections.ACCOUNTS,
    'email',
    supabaseUserEmail
  );

  return transformServerEntity(serverAccount);
};

export const updateUserAccount = async (
  id: string,
  account: PatchEntity<ServerAccount>
) => {
  return patch(Collections.ACCOUNTS, id, account);
};
