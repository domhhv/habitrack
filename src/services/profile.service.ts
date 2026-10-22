import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Profile, ProfilesUpdate, TypedSupabaseClient } from '@models';

export const getProfile = async (
  supabase: TypedSupabaseClient,
  userId: string
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const patchProfile = async (
  supabase: TypedSupabaseClient,
  userId: string,
  body: ProfilesUpdate
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(decamelizeKeys(body))
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};
