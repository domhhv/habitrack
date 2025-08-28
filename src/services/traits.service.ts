import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Trait, TraitsInsert } from '@models';
import { supabaseClient } from '@utils';

export const createTrait = async (body: TraitsInsert): Promise<Trait> => {
  const { data, error } = await supabaseClient
    .from('traits')
    .insert(decamelizeKeys(body))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const listTraits = async (): Promise<Trait[]> => {
  const { data, error } = await supabaseClient.from('traits').select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};
