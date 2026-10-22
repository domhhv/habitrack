import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Trait, TraitsInsert, TypedSupabaseClient } from '@models';

export const createTrait = async (
  supabase: TypedSupabaseClient,
  body: TraitsInsert
): Promise<Trait> => {
  const { data, error } = await supabase
    .from('traits')
    .insert(decamelizeKeys(body))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const listTraits = async (
  supabase: TypedSupabaseClient
): Promise<Trait[]> => {
  const { data, error } = await supabase.from('traits').select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};
