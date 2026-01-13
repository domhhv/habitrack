import { type UserAttributes } from '@supabase/supabase-js';
import camelcaseKeys from 'camelcase-keys';

import { supabaseClient } from '@utils';

export const signUp = async (email: string, password: string, name: string) => {
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account?emailConfirmed=true`,
      data: {
        firstDayOfWeek: 0,
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

export const updateUser = async (attributes: UserAttributes) => {
  const { data, error } = await supabaseClient.auth.updateUser(attributes);

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data.user, { deep: true });
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account?passwordReset=true`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getSession = async () => {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.user) {
    return null;
  }

  return camelcaseKeys(session.user, { deep: true });
};
