import { type PostEntity } from '@services';

export type Trait = {
  id: number;
  label: string;
  description: string | null;
  slug: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  color: string;
};

type TraitId = number;
export type TraitsMap = Record<TraitId, Trait>;

export type ServerTrait = {
  id: number;
  name: string;
  description: string;
  user_id: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type AddTrait = PostEntity<Trait>;
