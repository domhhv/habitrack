import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import {
  type Habit,
  StorageBuckets,
  type HabitMetric,
  type HabitsInsert,
  type HabitsUpdate,
  type HabitStockWithDefaults,
} from '@models';
import { uploadFile } from '@services';
import {
  supabaseClient,
  parseHabitMetric,
  parseMetricValueHolder,
} from '@utils';

const HABIT_SELECT = `
  *,
  trait:traits(name, color),
  metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at),
  stocks:habit_stocks(
    *,
    metric_defaults:habit_stock_metric_defaults(id, habit_metric_id, value, should_compound, created_at, updated_at),
    usages:occurrence_stock_usages(count)
  )
`;

type RawHabit = Omit<Habit, 'metricDefinitions' | 'stocks'> & {
  metricDefinitions: (Omit<HabitMetric, 'config' | 'habitId' | 'userId'> & {
    config: unknown;
  })[];
  stocks: (Omit<HabitStockWithDefaults, 'metricDefaults' | 'usageCount'> & {
    usages: { count: number }[];
    metricDefaults: (Omit<
      HabitStockWithDefaults['metricDefaults'][number],
      'value'
    > & {
      value: unknown;
    })[];
  })[];
};

/**
 * DB-read boundary for habits. Camel-cased rows carry metric `config` and stock-default `value` as
 * `Json`; the metric-shape predicates validate and narrow them cast-free (throwing on malformed
 * data; defended at write-time by the database's `habit_metrics_config_shape_check` constraint and the
 * `validate_metric_value` trigger).
 */
const transformHabit = ({
  metricDefinitions,
  stocks,
  ...habit
}: RawHabit): Habit => {
  return {
    ...habit,
    metricDefinitions: metricDefinitions.map(parseHabitMetric),
    stocks: stocks.map(({ metricDefaults, usages, ...stock }) => {
      return {
        ...stock,
        metricDefaults: metricDefaults.map(parseMetricValueHolder),
        usageCount: usages?.[0]?.count ?? 0,
      };
    }),
  };
};

export const createHabit = async (body: HabitsInsert): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .insert(decamelizeKeys(body))
    .select(HABIT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformHabit(camelcaseKeys(data, { deep: true }));
};

export const listHabits = async (): Promise<Habit[]> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .select(HABIT_SELECT)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true }).map(transformHabit);
};

export const patchHabit = async (
  id: Habit['id'],
  habit: HabitsUpdate
): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .update(decamelizeKeys(habit))
    .eq('id', id)
    .select(HABIT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformHabit(camelcaseKeys(data, { deep: true }));
};

export const getHabit = async (id: Habit['id']): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .select(HABIT_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformHabit(camelcaseKeys(data, { deep: true }));
};

export const destroyHabit = async (id: Habit['id']) => {
  const { error } = await supabaseClient.from('habits').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const uploadHabitIcon = async (
  userId: string,
  icon: File,
  iconPath: string | null = ''
) => {
  return uploadFile(
    StorageBuckets.HABIT_ICONS,
    iconPath || `${userId}/${Date.now()}-${icon.name}`,
    icon
  );
};
