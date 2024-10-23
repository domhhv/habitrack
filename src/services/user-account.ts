import { supabaseClient } from '@helpers';
import { type Account, type AccountUpdate } from '@models';
import { type UserAttributes } from '@supabase/supabase-js';
import { transformClientEntity, transformServerEntity } from '@utils';

export const fetchUser = async () => {
  const { error, data } = await supabaseClient.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data.user);
};

export const signUp = async (email: string, password: string, name: string) => {
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account?emailConfirmed=true`,
      data: {
        name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const updateUser = async (
  email: string,
  password: string,
  name: string
) => {
  const userAttributes: UserAttributes = {};

  if (email) {
    userAttributes.email = email;
  }

  if (password) {
    userAttributes.password = password;
  }

  if (name) {
    userAttributes.data = { name };
  }

  const { data, error } = await supabaseClient.auth.updateUser(userAttributes);

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data.user);
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account?passwordReset=true`,
  });

  if (error) {
    throw new Error(error.message);
  }
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

export const updateUserAccount = async (id: string, account: AccountUpdate) => {
  const serverBody = transformClientEntity({
    ...account,
    updatedAt: new Date().toISOString(),
  });

  const { error, data } = await supabaseClient
    .from('accounts')
    .update(serverBody)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};
