import { supabaseClient } from '@helpers';
import type { Trait, TraitsInsert } from '@models';
import { deepSnakify, deepCamelize } from '@utils';

export const createTrait = async (body: TraitsInsert): Promise<Trait> => {
  const serverBody = deepSnakify(body);

  const { data, error } = await supabaseClient
    .from('traits')
    .insert(serverBody)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const listTraits = async (): Promise<Trait[]> => {
  const { data, error } = await supabaseClient.from('traits').select();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(deepCamelize);
};
