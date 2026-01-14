import type { CalendarDateTime } from '@internationalized/date';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  CompositeTypes,
} from '@db-types';
import type { Note } from '@models';

import { type Habit } from './habit.model';
import { type Trait } from './trait.model';

export type Streak = CamelCasedPropertiesDeep<CompositeTypes<'streak_info'>>;

type BaseOccurrence = CamelCasedPropertiesDeep<Tables<'occurrences'>>;

type OccurrenceHabit = Pick<Habit, 'name' | 'iconPath'>;

type HabitWithTrait = OccurrenceHabit & {
  trait: Pick<Trait, 'id' | 'name' | 'color'>;
};

export type Occurrence = BaseOccurrence & {
  habit: HabitWithTrait;
  occurredAt?: CalendarDateTime;
} & {
  note: Pick<Note, 'id' | 'content'> | null;
};

export type OccurrencesInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrences'>
>;

export type OccurrencesUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'occurrences'>
>;

export type OccurrenceFilters = {
  habitIds: Set<string>;
  traitIds: Set<string>;
};
