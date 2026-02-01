import decamelizeKeys from 'decamelize-keys';

import {
  type Habit,
  StorageBuckets,
  type HabitsInsert,
  type HabitsUpdate,
} from '@models';
import { uploadFile } from '@services';
import { supabaseClient, deepCamelcaseKeys, deepCamelcaseArray } from '@utils';

export const createHabit = async (body: HabitsInsert): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .insert(decamelizeKeys(body))
    .select(
      `
      *,
      trait:traits(name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseKeys<Habit>(data);
};

export const listHabits = async () => {
  const { data, error } = await supabaseClient
    .from('habits')
    .select(
      `
      *,
      trait:traits(name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)
    `
    )
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseArray<Habit>(data);
};

export const patchHabit = async (
  id: Habit['id'],
  habit: HabitsUpdate
): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .update(decamelizeKeys(habit))
    .eq('id', id)
    .select(
      `
      *,
      trait:traits(name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseKeys<Habit>(data);
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
