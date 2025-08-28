import { type UserAttributes } from '@supabase/supabase-js';

import { supabaseClient } from '@helpers';

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
