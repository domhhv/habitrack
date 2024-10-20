import { supabaseClient } from '@helpers';
import { type Account } from '@models';
import type {
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { transformClientEntity, transformServerEntity } from '@utils';
import type { CamelCasedPropertiesDeep, SetOptional } from 'type-fest';

import type { TablesInsert } from '../../supabase/database.types';

export type AccountUpdate = CamelCasedPropertiesDeep<TablesInsert<'accounts'>>;

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  return supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account?emailConfirmed=true`,
      data: {
        name,
      },
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

export const signOut = () => {
  return supabaseClient.auth.signOut();
};

export const updateUserPassword = async (email: string, password: string) => {
  return supabaseClient.auth.updateUser({
    email,
    password,
  });
};

export const sendPasswordResetEmail = async (email: string) => {
  return supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account?passwordReset=true`,
  });
};

export const getUserAccountByEmail = async (
  supabaseUserEmail: string
): Promise<Account> => {
  const { error, data } = await supabaseClient
    .from('accounts')
    .select()
    .eq('email', supabaseUserEmail)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};

export const updateUserAccount = async (
  id: string,
  account: SetOptional<AccountUpdate, 'id' | 'email'>
) => {
  const serverBody = transformClientEntity(account);

  const { error, data } = await supabaseClient
    .from('accounts')
    .update({ ...serverBody, updated_at: new Date().toString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};
