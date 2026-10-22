import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import {
  type Habit,
  StorageBuckets,
  type HabitMetric,
  type HabitsInsert,
  type HabitsUpdate,
  type TypedSupabaseClient,
  type HabitStockWithDefaults,
} from '@models';
import { uploadFile } from '@services';
import { parseHabitMetric, parseMetricValueHolder } from '@utils';

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

export const createHabit = async (
  supabase: TypedSupabaseClient,
  body: HabitsInsert
): Promise<Habit> => {
  const { data, error } = await supabase
    .from('habits')
    .insert(decamelizeKeys(body))
    .select(HABIT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformHabit(camelcaseKeys(data, { deep: true }));
};

export const listHabits = async (
  supabase: TypedSupabaseClient
): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select(HABIT_SELECT)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true }).map(transformHabit);
};

export const patchHabit = async (
  supabase: TypedSupabaseClient,
  id: Habit['id'],
  habit: HabitsUpdate
): Promise<Habit> => {
  const { data, error } = await supabase
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

export const listHabitIds = async (supabase: TypedSupabaseClient) => {
  const { data, error } = await supabase.from('habits').select('id');

  if (error) {
    throw new Error(error.message);
  }

  return data.map(({ id }) => {
    return id;
  });
};

export const getHabit = async (
  supabase: TypedSupabaseClient,
  id: Habit['id']
): Promise<Habit | null> => {
  const { data, error } = await supabase
    .from('habits')
    .select(HABIT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data && transformHabit(camelcaseKeys(data, { deep: true }));
};

export const destroyHabit = async (
  supabase: TypedSupabaseClient,
  id: Habit['id']
) => {
  const { error } = await supabase.from('habits').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const uploadHabitIcon = async (
  supabase: TypedSupabaseClient,
  userId: string,
  icon: File,
  iconPath: string | null = ''
) => {
  return uploadFile(
    supabase,
    StorageBuckets.HABIT_ICONS,
    iconPath || `${userId}/${Date.now()}-${icon.name}`,
    icon
  );
};
