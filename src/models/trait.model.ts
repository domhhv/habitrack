export type Trait = {
  id: number;
  name: string;
  description: string;
  slug: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

type TraitId = number;
export type TraitsMap = Record<TraitId, Trait>;

export type ServerTrait = {
  id: number;
  name: string;
  description: string;
  user_id?: string;
  slug: string;
  created_at: string;
  updated_at: string;
};
