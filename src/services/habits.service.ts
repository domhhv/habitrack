import { supabaseClient } from '@helpers';
import {
  type Habit,
  StorageBuckets,
  type HabitsInsert,
  type HabitsUpdate,
} from '@models';
import { uploadFile } from '@services';
import { deepSnakify, deepCamelize } from '@utils';

export const createHabit = async (body: HabitsInsert): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .insert(deepSnakify(body))
    .select('*, trait:traits(name, color)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const listHabits = async () => {
  const { data, error } = await supabaseClient
    .from('habits')
    .select('*, trait:traits(id, name, color)')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data.map(deepCamelize);
};

export const patchHabit = async (
  id: Habit['id'],
  habit: HabitsUpdate
): Promise<Habit> => {
  const { data, error } = await supabaseClient
    .from('habits')
    .update(deepSnakify(habit))
    .eq('id', id)
    .select('*, trait:traits(id, name, color)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
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
