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
import { supabaseClient, deepCamelcaseKeys, deepCamelcaseArray } from '@utils';

import { deleteFile } from './storage.service';

export const createOccurrence = async (occurrence: OccurrencesInsert) => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .insert(decamelizeKeys(occurrence))
    .select(
      `
      *,
      habit:habits(name, icon_path, trait:traits(id, name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)),
      metric_values:occurrence_metric_values(id, value, created_at, updated_at, habit_metric_id))
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseKeys<RawOccurrence>(data);
};

export const listOccurrences = async ([rangeStart, rangeEnd]: [
  ZonedDateTime,
  ZonedDateTime,
]): Promise<RawOccurrence[]> => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .select(
      `
      *,
      habit:habits(name, icon_path, trait:traits(id, name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)),
      metric_values:occurrence_metric_values(id, value, created_at, updated_at, habit_metric_id)
    `
    )
    .order('occurred_at')
    .gt('occurred_at', rangeStart.toAbsoluteString())
    .lt('occurred_at', rangeEnd.toAbsoluteString());

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseArray<RawOccurrence>(data);
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
      `
      *,
      habit:habits(name, icon_path, trait:traits(id, name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)),
      metric_values:occurrence_metric_values(id, value, created_at, updated_at, habit_metric_id)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseKeys<RawOccurrence>(data);
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

export const getLatestHabitOccurrence = async (habitId: Habit['id']) => {
  const { data, error } = await supabaseClient
    .from('occurrences')
    .select(
      `
      *,
      habit:habits(name, icon_path, trait:traits(id, name, color),
      metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)),
      metric_values:occurrence_metric_values(id, value, created_at, updated_at, habit_metric_id)
    `
    )
    .eq('habit_id', habitId)
    .lt('occurred_at', new Date().toISOString())
    .limit(1)
    .order('occurred_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return null;
  }

  return deepCamelcaseKeys<RawOccurrence>(data[0]);
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

export const getHabitsStats = async (habitIds: Habit['id'][]) => {
  const { data, error } = await supabaseClient.rpc('get_habits_stats', {
    p_habit_ids: habitIds,
    p_time_zone: getLocalTimeZone(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};
