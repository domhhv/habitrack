import { supabaseClient } from '@helpers';
import type { AddOccurrence, Occurrence, ServerOccurrence } from '@models';
import {
  cache,
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

import {
  Collections,
  destroy,
  fetch,
  getInRange,
  patch,
  type PatchEntity,
  post,
} from './supabase';

export const createOccurrence = async (occurrence: AddOccurrence) => {
  const serverBody = transformClientEntity(occurrence);
  const serverOccurrence = await post<Occurrence>(
    Collections.OCCURRENCES,
    serverBody
  );
  return transformServerEntity(serverOccurrence);
};

export const getLatestHabitOccurrenceTimestamp = async (
  habitId: number
): Promise<number> => {
  const { data } = await fetch(Collections.OCCURRENCES)
    .select('timestamp')
    .eq('habit_id', habitId)
    .limit(1)
    .order('timestamp', { ascending: false });

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
  const { data } = await fetch(Collections.OCCURRENCES)
    .select('id')
    .eq('habit_id', habitId);

  return data?.length || null;
};

export const listOccurrences = async (range: [number, number]) => {
  if (cache.has(range.toString())) {
    return cache.get(range.toString()) as Occurrence[];
  }

  const occurrences = await getInRange<ServerOccurrence>(
    Collections.OCCURRENCES,
    'timestamp',
    range
  );

  const result = transformServerEntities(
    occurrences
  ) as unknown as Occurrence[];

  cache.set(range.toString(), result);

  return result;
};

export const updateOccurrence = async (
  id: number,
  occurrence: PatchEntity<Occurrence>
) => {
  const serverOccurrence = await patch<ServerOccurrence>(
    Collections.OCCURRENCES,
    id,
    occurrence
  );
  return transformServerEntity(serverOccurrence);
};

export const destroyOccurrence = async (id: number) => {
  const destroyedOccurrence = await destroy<Occurrence>(
    Collections.OCCURRENCES,
    id
  );

  return transformServerEntity(destroyedOccurrence);
};
