import type { Trait } from '@models';

import {
  Collections,
  destroy,
  get,
  patch,
  post,
  type PatchEntity,
} from './supabase';

export const createTrait = async (body: Trait) => {
  return post<Trait>(Collections.TRAITS, body as Trait);
};

export const listTraits = () => {
  return get<Trait>(Collections.TRAITS);
};

export const patchTrait = (id: number, body: PatchEntity<Trait>) => {
  return patch<Trait>(Collections.TRAITS, id, body);
};

export const destroyTrait = (id: number) => {
  return destroy<Trait>(Collections.TRAITS, id);
};
