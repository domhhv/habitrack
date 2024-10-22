import type { CamelCasedPropertiesDeep } from 'type-fest';

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../supabase/database.types';

import { type Trait } from './trait.model';

type RawHabit = CamelCasedPropertiesDeep<Tables<'habits'>>;

export type Habit = RawHabit & {
  trait: Pick<Trait, 'name' | 'color'> | null;
};

export type HabitsInsert = CamelCasedPropertiesDeep<TablesInsert<'habits'>>;
export type HabitsUpdate = CamelCasedPropertiesDeep<TablesUpdate<'habits'>>;
