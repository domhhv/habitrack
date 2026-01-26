import { getLocalTimeZone, type ZonedDateTime } from '@internationalized/date';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  Habit,
  Streak,
  RawOccurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
} from '@models';
import { StorageBuckets } from '@models';
import { supabaseClient } from '@utils';

import { deleteFile } from './storage.service';

export const createOccurrence = async (occurrence: OccurrencesInsert) => {
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

export const listOccurrences = async ([rangeStart, rangeEnd]: [
  ZonedDateTime,
  ZonedDateTime,
]): Promise<RawOccurrence[]> => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .select(
      '*, habit:habits(name, icon_path, trait:traits(id, name, color)), note:notes(id, content)'
    )
    .order('occurred_at')
    .gt('occurred_at', rangeStart.toAbsoluteString())
    .lt('occurred_at', rangeEnd.toAbsoluteString());

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const patchOccurrence = async (
  id: RawOccurrence['id'],
  occurrence: OccurrencesUpdate
): Promise<RawOccurrence> => {
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

export const destroyOccurrence = async ({
  id,
  photoPaths,
}: Pick<RawOccurrence, 'id' | 'photoPaths'>) => {
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
    .select('occurred_at')
    .eq('habit_id', habitId)
    .lt('occurred_at', new Date().toISOString())
    .limit(1)
    .order('occurred_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return 0;
  }

  const [{ occurred_at }] = data;

  return Number(new Date(occurred_at));
};

export const getLongestHabitStreak = async (
  habitId: Habit['id']
): Promise<Streak> => {
  const { data, error } = await supabaseClient.rpc('get_longest_streak', {
    p_habit_id: habitId,
    p_time_zone: getLocalTimeZone(), // TODO: replace with preferred timezone from to be created user settings table
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
