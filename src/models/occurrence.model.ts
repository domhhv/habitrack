import type { CalendarDay } from '@helpers';
import type { Note } from '@root/src/models/note.model';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type {
  TablesInsert,
  Tables,
  CompositeTypes,
  TablesUpdate,
} from '../../supabase/database.types';

import { type Habit } from './habit.model';
import { type Trait } from './trait.model';

export type Streak = CamelCasedPropertiesDeep<CompositeTypes<'streak_info'>>;

type BaseOccurrence = CamelCasedPropertiesDeep<Tables<'occurrences'>>;

type OccurrenceHabit = Pick<Habit, 'name' | 'iconPath'>;

type HabitWithTrait = OccurrenceHabit & {
  trait: Pick<Trait, 'id' | 'name' | 'color'> | null;
};

export type Occurrence = BaseOccurrence & {
  habit: HabitWithTrait | null;
} & {
  notes: Pick<Note, 'id' | 'content'>[];
};

export type OccurrencesDateMap = Record<CalendarDay, Occurrence[]>;

export type OccurrencesInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrences'>
>;
export type OccurrencesUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'occurrences'>
>;
