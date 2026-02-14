import type { ZonedDateTime } from '@internationalized/date';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  CompositeTypes,
} from '@db-types';

import { type Habit } from './habit.model';
import type { OccurrenceMetricValue } from './metric.model';
import { type Trait } from './trait.model';

export type Streak = CamelCasedPropertiesDeep<CompositeTypes<'streak_info'>>;

export type HabitStats = CamelCasedPropertiesDeep<
  CompositeTypes<'habit_stats'>
>;

type BaseOccurrence = CamelCasedPropertiesDeep<Tables<'occurrences'>>;

type OccurrenceHabit = Pick<
  Habit,
  'name' | 'iconPath' | 'metricDefinitions'
> & {
  trait: Pick<Trait, 'id' | 'name' | 'color'> | null;
};

export type RawOccurrence = BaseOccurrence & {
  habit: OccurrenceHabit;
} & {
  metricValues: Omit<OccurrenceMetricValue, 'userId' | 'occurrenceId'>[];
};

export type Occurrence = Omit<
  RawOccurrence,
  'occurredAt' | 'createdAt' | 'updatedAt'
> & {
  createdAt: ZonedDateTime;
  occurredAt: ZonedDateTime;
  updatedAt: ZonedDateTime | null;
};

export type OccurrencesInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrences'>
>;

export type OccurrencesUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'occurrences'>
>;
