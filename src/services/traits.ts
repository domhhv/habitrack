import { supabaseClient } from '@helpers';
import { type Trait } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { TablesInsert } from '../../supabase/database.types';

export type TraitsInsert = CamelCasedPropertiesDeep<TablesInsert<'traits'>>;

export const createTrait = async (body: TraitsInsert): Promise<Trait> => {
  const serverBody = transformClientEntity(body);

  const { error, data } = await supabaseClient
    .from('traits')
    .insert(serverBody)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};

export const listTraits = async () => {
  const { error, data } = await supabaseClient.from('traits').select();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntities(data);
};
