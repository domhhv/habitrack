import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

import { type Trait } from './trait.model';

type BaseHabit = CamelCasedPropertiesDeep<Tables<'habits'>>;

export type Habit = BaseHabit & {
  trait: Pick<Trait, 'name' | 'color'> | null;
};

export type HabitsInsert = CamelCasedPropertiesDeep<TablesInsert<'habits'>>;
export type HabitsUpdate = CamelCasedPropertiesDeep<TablesUpdate<'habits'>>;
