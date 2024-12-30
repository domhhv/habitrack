import type { CalendarDay } from '@helpers';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { TablesInsert, Tables } from '../../supabase/database.types';

import { type Habit } from './habit.model';
import { type Trait } from './trait.model';

type BaseOccurrence = CamelCasedPropertiesDeep<Tables<'occurrences'>>;

type OccurrenceHabit = Pick<Habit, 'name' | 'iconPath'>;

type HabitWithTrait = OccurrenceHabit & {
  trait: Pick<Trait, 'id' | 'name' | 'color'> | null;
};

export type Occurrence = BaseOccurrence & {
  habit: HabitWithTrait | null;
};

export type OccurrencesDateMap = Record<CalendarDay, Occurrence[]>;

export type OccurrencesInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrences'>
>;
