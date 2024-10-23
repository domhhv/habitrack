import { supabaseClient } from '@helpers';
import { type Habit, type HabitsInsert, type HabitsUpdate } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

export const createHabit = async (body: HabitsInsert): Promise<Habit> => {
  const serverBody = transformClientEntity(body);

  const { error, data } = await supabaseClient
    .from('habits')
    .insert(serverBody)
    .select('*, trait:traits(name, color)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};

export const listHabits = async () => {
  const { error, data } = await supabaseClient
    .from('habits')
    .select('*, trait:traits(id, name, color)');

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntities(data);
};

export const patchHabit = async (
  id: number,
  body: HabitsUpdate
): Promise<Habit> => {
  const serverUpdates = transformClientEntity({
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

  return transformServerEntity(data);
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

  return transformServerEntity(data);
};
