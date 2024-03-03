import type { ServerTrait, Trait, AddTrait } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

import {
  Collections,
  destroy,
  get,
  patch,
  post,
  type PatchEntity,
} from './supabase';

export const createTrait = async (body: AddTrait) => {
  const serverBody: ServerTrait = transformClientEntity(body);

  const trait = await post<ServerTrait>(Collections.TRAITS, serverBody);

  return transformServerEntity(trait) as unknown as Trait;
};

export const listTraits = async () => {
  const traits = await get<Trait[]>(Collections.TRAITS);

  return transformServerEntities(traits) as unknown as Trait[];
};

export const patchTrait = async (id: number, body: PatchEntity<Trait>) => {
  const serverUpdates: ServerTrait = transformClientEntity(body);
  const trait = await patch<Trait>(Collections.TRAITS, id, serverUpdates);
  return transformServerEntity(trait);
};

export const destroyTrait = async (id: number) => {
  const serverTrait = await destroy<Trait>(Collections.TRAITS, id);

  return transformServerEntity(serverTrait) as unknown as Trait;
};
