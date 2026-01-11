import { type UserAttributes } from '@supabase/supabase-js';

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

export const updateUser = async (opts: {
  email?: string;
  firstDayOfWeek?: number;
  name?: string;
  password?: string;
}) => {
  const userAttributes: UserAttributes = {};

  if (opts.email) {
    userAttributes.email = opts.email;
  }

  if (opts.password) {
    userAttributes.password = opts.password;
  }

  const userMetadata: Record<string, string | number> = {};

  if (opts.name) {
    userMetadata.name = opts.name;
  }

  if (typeof opts.firstDayOfWeek === 'number') {
    userMetadata.firstDayOfWeek = opts.firstDayOfWeek;
  }

  if (Object.keys(userMetadata).length > 0) {
    userAttributes.data = userMetadata;
  }

  const { error } = await supabaseClient.auth.updateUser(userAttributes);

  if (error) {
    throw new Error(error.message);
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account?passwordReset=true`,
  });

  if (error) {
    throw new Error(error.message);
  }
};
