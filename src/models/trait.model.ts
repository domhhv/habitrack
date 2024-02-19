export type Trait = {
  id: number;
  name: string;
  description: string;
  user_id?: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

type TraitId = number;
export type TraitsMap = Record<TraitId, Trait>;
