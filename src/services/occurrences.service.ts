import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import { supabaseClient } from '@helpers';
import type {
  Habit,
  Streak,
  Occurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
} from '@models';
import { StorageBuckets } from '@models';

import { deleteFile } from './storage.service';

export const createOccurrence = async (
  occurrence: OccurrencesInsert
): Promise<Occurrence> => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .insert(decamelizeKeys(occurrence))
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), note:notes(id, content)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const listOccurrences = async (
  range: [number, number]
): Promise<Occurrence[]> => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), note:notes(id, content)'
    )
    .order('timestamp')
    .gt('timestamp', range[0])
    .lt('timestamp', range[1]);

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const patchOccurrence = async (
  id: Occurrence['id'],
  occurrence: OccurrencesUpdate
): Promise<Occurrence> => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .update(decamelizeKeys(occurrence))
    .eq('id', id)
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), note:notes(id, content)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const destroyOccurrence = async ({ id, photoPaths }: Occurrence) => {
  const { error } = await supabaseClient
    .from('occurrences')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  if (photoPaths) {
    await Promise.allSettled(
      photoPaths.map((photoPath) => {
        return deleteFile(StorageBuckets.OCCURRENCE_PHOTOS, photoPath);
      })
    );
  }
};

export const getLatestHabitOccurrenceTimestamp = async (
  habitId: Habit['id']
) => {
  const { data, error } = await supabaseClient
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
  habitId: Habit['id']
): Promise<Streak> => {
  const { data, error } = await supabaseClient.rpc('get_longest_streak', {
    p_habit_id: habitId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const getHabitTotalEntries = async (habitId: Habit['id']) => {
  const { count, error } = await supabaseClient
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
