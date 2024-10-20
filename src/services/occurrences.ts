import { supabaseClient } from '@helpers';
import type { Occurrence } from '@models';
import {
  cache,
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';
import { type CamelCasedPropertiesDeep } from 'type-fest';

import type { TablesInsert } from '../../supabase/database.types';

export type OccurrencesInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrences'>
>;

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

export const listOccurrences = async (range: [number, number]) => {
  if (cache.has(range.toString())) {
    return cache.get(range.toString()) as Occurrence[];
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

  cache.set(range.toString(), result);

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

export const getLatestHabitOccurrenceTimestamp = async (
  habitId: number
): Promise<number | null> => {
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
): Promise<number | null> => {
  const { data } = await supabaseClient.rpc('get_longest_streak', {
    habit_identifier: habitId,
  });

  if (!data?.length) {
    return null;
  }

  const [{ streak_length: streakLength }] = data;

  return streakLength;
};

export const getHabitTotalEntries = async (habitId: number) => {
  const { count } = await supabaseClient
    .from('occurrences')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('habit_id', habitId);

  return count;
};
