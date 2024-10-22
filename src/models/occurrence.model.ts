import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { TablesInsert, Tables } from '../../supabase/database.types';

import { type Habit } from './habit.model';
import { type Trait } from './trait.model';

type BaseOccurrence = CamelCasedPropertiesDeep<Tables<'occurrences'>>;

type HabitTrait = Pick<Habit, 'name' | 'iconPath'>;

type HabitWithTrait = HabitTrait & {
  trait: Pick<Trait, 'id' | 'name' | 'color'> | null;
};

export type Occurrence = BaseOccurrence & {
  habit: HabitWithTrait | null;
};

type OccurrenceDate = string;
export type OccurrencesDateMap = Record<OccurrenceDate, Occurrence[]>;

export type OccurrencesInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrences'>
>;
