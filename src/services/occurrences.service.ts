import { supabaseClient } from '@helpers';
import type {
  Occurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
  Streak,
} from '@models';
import { deepSnakify, deepCamelize } from '@utils';

export const createOccurrence = async (
  body: OccurrencesInsert
): Promise<Occurrence> => {
  const serverBody = deepSnakify(body);

  const { error, data } = await supabaseClient
    .from('occurrences')
    .insert(serverBody)
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), notes(id, content)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const listOccurrences = async (
  range: [number, number]
): Promise<Occurrence[]> => {
  const { error, data } = await supabaseClient
    .from('occurrences')
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), notes(id, content)'
    )
    .order('timestamp')
    .gt('timestamp', range[0])
    .lt('timestamp', range[1]);

  if (error) {
    throw new Error(error.message);
  }

  return data.map(deepCamelize);
};

export const patchOccurrence = async (
  id: number,
  body: OccurrencesUpdate
): Promise<Occurrence> => {
  const serverUpdates = deepSnakify({
    ...body,
    updatedAt: new Date().toISOString(),
  });

  const { error, data } = await supabaseClient
    .from('occurrences')
    .update(serverUpdates)
    .eq('id', id)
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), notes(id, content)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const destroyOccurrence = async (id: number) => {
  const { error, data } = await supabaseClient
    .from('occurrences')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const getLatestHabitOccurrenceTimestamp = async (habitId: number) => {
  const { error, data } = await supabaseClient
    .from('occurrences')
    .select('timestamp')
    .eq('habit_id', habitId)
    .limit(1)
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return 0;
  }

  const [{ timestamp }] = data;

  return timestamp;
};

export const getLongestHabitStreak = async (
  habitId: number
): Promise<Streak> => {
  const { error, data } = await supabaseClient.rpc('get_longest_streak', {
    p_habit_id: habitId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const getHabitTotalEntries = async (habitId: number) => {
  const { error, count } = await supabaseClient
    .from('occurrences')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('habit_id', habitId);

  if (error) {
    throw new Error(error.message);
  }

  return count;
};
