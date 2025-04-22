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
  const serverBody = deepSnakify(body);

  const { error, data } = await supabaseClient
    .from('habits')
    .insert(serverBody)
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
  body: HabitsUpdate
): Promise<Habit> => {
  const serverUpdates = deepSnakify({
    ...body,
    updatedAt: new Date().toISOString(),
  });

  const { error, data } = await supabaseClient
    .from('habits')
    .update(serverUpdates)
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

export const uploadHabitIcon = async (userId: string, icon?: File | null) => {
  let iconPath = '';

  if (icon) {
    iconPath = `${userId}/${Date.now()}-${icon.name}`;
    await uploadFile(StorageBuckets.HABIT_ICONS, iconPath, icon);
  }

  return iconPath;
};
