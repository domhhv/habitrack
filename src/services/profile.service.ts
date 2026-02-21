import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Profile, ProfilesUpdate } from '@models';
import { supabaseClient } from '@utils';

export const getProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabaseClient
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
  userId: string,
  body: ProfilesUpdate
): Promise<Profile> => {
  const { data, error } = await supabaseClient
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
