import { supabaseClient } from '@helpers';
import {
  type Habit,
  type HabitsInsert,
  type HabitsUpdate,
  StorageBuckets,
} from '@models';
import { uploadFile } from '@root/src/services/storage.service';
import { deepSnakify, deepCamelize } from '@utils';

export const createHabit = async (body: HabitsInsert): Promise<Habit> => {
  const { error, data } = await supabaseClient
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
  const { error, data } = await supabaseClient
    .from('habits')
    .select('*, trait:traits(id, name, color)')
    .order('id');

  if (error) {
    throw new Error(error.message);
  }

  return data.map(deepCamelize);
};

export const patchHabit = async (
  id: number,
  habit: HabitsUpdate
): Promise<Habit> => {
  const { error, data } = await supabaseClient
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

export const destroyHabit = async (id: number): Promise<Habit> => {
  const { error, data } = await supabaseClient
    .from('habits')
    .delete()
    .eq('id', id)
    .select('*, trait:traits(id, name, color)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const uploadHabitIcon = async (
  userId: string,
  icon: File,
  iconPath: string | null = ''
) => {
  return uploadFile(
    StorageBuckets.HABIT_ICONS,
    iconPath || `${userId}/${Date.now()}-${icon.name}`,
    icon,
    '0'
  );
};
