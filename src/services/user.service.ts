import {
  type UserIdentity,
  type EmailOtpType,
  type UserAttributes,
} from '@supabase/supabase-js';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { DaysOfWeek, TypedSupabaseClient } from '@models';

const getAuthCallbackUrl = (next: string) => {
  const url = new URL('/auth/callback', window.location.origin);
  url.searchParams.set('next', next);

  return url.href;
};

export const signUp = async (
  supabase: TypedSupabaseClient,
  email: string,
  password: string,
  firstDayOfWeek: DaysOfWeek
) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/settings?emailConfirmed=true`,
      data: decamelizeKeys({
        firstDayOfWeek,
      }),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const signInAnonymously = async (
  supabase: TypedSupabaseClient,
  firstDayOfWeek: DaysOfWeek
) => {
  const { error } = await supabase.auth.signInAnonymously({
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

export const signInWithGoogle = async (supabase: TypedSupabaseClient) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl('/calendar'),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getUserIdentities = async (supabase: TypedSupabaseClient) => {
  const { data, error } = await supabase.auth.getUserIdentities();

  if (error) {
    throw new Error(error.message);
  }

  return data.identities;
};

export const linkGoogleIdentity = async (supabase: TypedSupabaseClient) => {
  const { error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl('/settings'),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const unlinkIdentity = async (
  supabase: TypedSupabaseClient,
  identity: UserIdentity
) => {
  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    throw new Error(error.message);
  }
};

export const convertAnonymousUser = async (
  supabase: TypedSupabaseClient,
  email: string,
  password: string
) => {
  const { error } = await supabase.auth.updateUser(
    { email, password },
    {
      emailRedirectTo: `${window.location.origin}/settings?emailConfirmed=true`,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
};

export const signIn = async (
  supabase: TypedSupabaseClient,
  email: string,
  password: string
) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const signOut = async (supabase: TypedSupabaseClient) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteUser = async (supabase: TypedSupabaseClient) => {
  const { data, error } = await supabase.rpc('delete_user');

  if (error) {
    throw new Error(error.message);
  }

  const { error: signOutError } = await supabase.auth.signOut({
    scope: 'local',
  });

  if (signOutError) {
    throw new Error(signOutError.message);
  }

  return data;
};

export const updateUser = async (
  supabase: TypedSupabaseClient,
  attributes: UserAttributes
) => {
  const { data, error } = await supabase.auth.updateUser(attributes, {
    emailRedirectTo: `${window.location.origin}/settings?emailChangeConfirmed=true`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data.user, { deep: true });
};

export const getUser = async (supabase: TypedSupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  return camelcaseKeys(user, { deep: true });
};

export const sendPasswordResetEmail = async (
  supabase: TypedSupabaseClient,
  email: string
) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/settings?passwordReset=true`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getSession = async (supabase: TypedSupabaseClient) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

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

export const exchangeCodeForSession = async (
  supabase: TypedSupabaseClient,
  code: string
) => {
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(error.message);
  }
};

export const verifyEmailOtp = async (
  supabase: TypedSupabaseClient,
  tokenHash: string,
  type: EmailOtpType
) => {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    throw new Error(error.message);
  }
};
