import decamelizeKeys from 'decamelize-keys';

import {
  type Habit,
  StorageBuckets,
  type HabitsInsert,
  type HabitsUpdate,
  type HabitStockWithDefaults,
} from '@models';
import { uploadFile } from '@services';
import { supabaseClient, deepCamelcaseKeys } from '@utils';

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

type RawHabit = Omit<Habit, 'stocks'> & {
  stocks: (Omit<HabitStockWithDefaults, 'usageCount'> & {
    usages: { count: number }[];
  })[];
};

const transformHabit = (data: unknown): Habit => {
  const raw = deepCamelcaseKeys<RawHabit>(data);

  return {
    ...raw,
    stocks: raw.stocks.map(({ usages, ...stock }) => {
      return {
        ...stock,
        usageCount: usages?.[0]?.count ?? 0,
      };
    }),
  };
};

const transformHabits = (data: unknown[]): Habit[] => {
  return data.map(transformHabit);
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

  return transformHabit(data);
};

export const listHabits = async () => {
  const { data, error } = await supabaseClient
    .from('habits')
    .select(HABIT_SELECT)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return transformHabits(data);
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

  return transformHabit(data);
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

  return transformHabit(data);
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
