import { type UserIdentity, type UserAttributes } from '@supabase/supabase-js';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { DaysOfWeek } from '@models';
import { supabaseClient } from '@utils';

export const signUp = async (
  email: string,
  password: string,
  firstDayOfWeek: DaysOfWeek
) => {
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account?emailConfirmed=true`,
      data: decamelizeKeys({
        firstDayOfWeek,
      }),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const signInAnonymously = async (firstDayOfWeek: DaysOfWeek) => {
  const { error } = await supabaseClient.auth.signInAnonymously({
    options: {
      data: decamelizeKeys({
        firstDayOfWeek,
      }),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async () => {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/calendar`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getUserIdentities = async () => {
  const { data, error } = await supabaseClient.auth.getUserIdentities();

  if (error) {
    throw new Error(error.message);
  }

  return data.identities;
};

export const linkGoogleIdentity = async () => {
  const { error } = await supabaseClient.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/account`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const unlinkIdentity = async (identity: UserIdentity) => {
  const { error } = await supabaseClient.auth.unlinkIdentity(identity);

  if (error) {
    throw new Error(error.message);
  }
};

export const convertAnonymousUser = async (email: string, password: string) => {
  const { error } = await supabaseClient.auth.updateUser(
    { email, password },
    {
      emailRedirectTo: `${window.location.origin}/account?emailConfirmed=true`,
    }
  );

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

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabaseClient.rpc('delete_user');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateUser = async (attributes: UserAttributes) => {
  const { data, error } = await supabaseClient.auth.updateUser(attributes, {
    emailRedirectTo: `${window.location.origin}/account?emailChangeConfirmed=true&newEmail=${attributes.email}&userId=${attributes}`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data.user, { deep: true });
};

export const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  return camelcaseKeys(user, { deep: true });
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

  return camelcaseKeys(
    { ...session.user, fetchedAt: new Date().toISOString() },
    { deep: true }
  );
};
