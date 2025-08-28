import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import { supabaseClient } from '@helpers';
import type { Trait, TraitsInsert } from '@models';

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
