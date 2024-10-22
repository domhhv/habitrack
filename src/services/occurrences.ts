import { cacheOccurrences, occurrencesCache, supabaseClient } from '@helpers';
import type { Occurrence, OccurrencesInsert } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

export const createOccurrence = async (
  body: OccurrencesInsert
): Promise<Occurrence> => {
  const serverBody = transformClientEntity(body);

  const { error, data } = await supabaseClient
    .from('occurrences')
    .insert(serverBody)
    .select('*, habit:habits(name, icon_path, trait:traits(id, name, color))')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};

export const listOccurrences = async (
  range: [number, number]
): Promise<Occurrence[]> => {
  const cachedOccurrences = occurrencesCache.get(range.toString());

  if (cachedOccurrences) {
    return cachedOccurrences;
  }

  const { error, data } = await supabaseClient
    .from('occurrences')
    .select('*, habit:habits(name, icon_path, trait:traits(id, name, color))')
    .gt('timestamp', range[0])
    .lt('timestamp', range[1]);

  if (error) {
    throw new Error(error.message);
  }

  const result = transformServerEntities(data);

  cacheOccurrences(range, result);

  return result;
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

  return transformServerEntity(data);
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

export const getLongestHabitStreak = async (habitId: number) => {
  const { error, data } = await supabaseClient.rpc('get_longest_streak', {
    habit_identifier: habitId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return null;
  }

  const [{ streak_length: streakLength }] = data;

  return streakLength;
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
