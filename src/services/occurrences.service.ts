import { getLocalTimeZone, type ZonedDateTime } from '@internationalized/date';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  Habit,
  Streak,
  RawOccurrence,
  OccurrencesInsert,
  OccurrencesUpdate,
  TypedSupabaseClient,
} from '@models';
import { StorageBuckets } from '@models';
import { parseHabitMetric, parseMetricValueHolder } from '@utils';

import { deleteFile } from './storage.service';

const OCCURRENCE_SELECT = `
  *,
  habit:habits(name, icon_path, trait:traits(id, name, color),
  metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, created_at, updated_at)),
  metric_values:occurrence_metric_values(id, value, created_at, updated_at, habit_metric_id),
  stock_usages:occurrence_stock_usages(id, habit_stock_id, quantity, created_at, updated_at)
`;

type RawOccurrenceRow = Omit<RawOccurrence, 'habit' | 'metricValues'> & {
  habit: Omit<RawOccurrence['habit'], 'metricDefinitions'> & {
    metricDefinitions: (Omit<
      RawOccurrence['habit']['metricDefinitions'][number],
      'config'
    > & {
      config: unknown;
    })[];
  };
  metricValues: (Omit<RawOccurrence['metricValues'][number], 'value'> & {
    value: unknown;
  })[];
};

/**
 * DB-read boundary for occurrences. Camel-cased rows carry each metric value's `value` and the
 * habit's metric-definition `config` as `Json`; the metric-shape predicates validate and narrow
 * them cast-free (throwing on malformed data; defended at write-time by the database's
 * `habit_metrics_config_shape_check` constraint and the `validate_metric_value` trigger).
 */
const toRawOccurrence = ({
  habit,
  metricValues,
  ...occurrence
}: RawOccurrenceRow): RawOccurrence => {
  return {
    ...occurrence,
    metricValues: metricValues.map(parseMetricValueHolder),
    habit: {
      ...habit,
      metricDefinitions: habit.metricDefinitions.map(parseHabitMetric),
    },
  };
};

export const createOccurrence = async (
  supabase: TypedSupabaseClient,
  occurrence: OccurrencesInsert
): Promise<RawOccurrence> => {
  const { data, error } = await supabase
    .from('occurrences')
    .insert(decamelizeKeys(occurrence))
    .select(OCCURRENCE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toRawOccurrence(camelcaseKeys(data, { deep: true }));
};

export const listOccurrences = async (
  supabase: TypedSupabaseClient,
  [rangeStart, rangeEnd]: [ZonedDateTime, ZonedDateTime]
): Promise<RawOccurrence[]> => {
  const { data, error } = await supabase
    .from('occurrences')
    .select(OCCURRENCE_SELECT)
    .order('occurred_at')
    .gt('occurred_at', rangeStart.toAbsoluteString())
    .lt('occurred_at', rangeEnd.toAbsoluteString());

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true }).map(toRawOccurrence);
};

export const getOccurrence = async (
  supabase: TypedSupabaseClient,
  id: RawOccurrence['id']
): Promise<RawOccurrence | null> => {
  const { data, error } = await supabase
    .from('occurrences')
    .select(OCCURRENCE_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data && toRawOccurrence(camelcaseKeys(data, { deep: true }));
};

export const patchOccurrence = async (
  supabase: TypedSupabaseClient,
  id: RawOccurrence['id'],
  occurrence: OccurrencesUpdate
): Promise<RawOccurrence> => {
  const { data, error } = await supabase
    .from('occurrences')
    .update(decamelizeKeys(occurrence))
    .eq('id', id)
    .select(OCCURRENCE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toRawOccurrence(camelcaseKeys(data, { deep: true }));
};

export const destroyOccurrence = async (
  supabase: TypedSupabaseClient,
  { id, photoPaths }: Pick<RawOccurrence, 'id' | 'photoPaths'>
) => {
  const { error } = await supabase.from('occurrences').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  if (photoPaths) {
    await Promise.allSettled(
      photoPaths.map((photoPath) => {
        return deleteFile(
          supabase,
          StorageBuckets.OCCURRENCE_PHOTOS,
          photoPath
        );
      })
    );
  }
};

export const getLatestHabitOccurrence = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id']
) => {
  const { data, error } = await supabase
    .from('occurrences')
    .select(OCCURRENCE_SELECT)
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

  return toRawOccurrence(camelcaseKeys(data[0], { deep: true }));
};

// TODO: Remove unused Supabase RPC and this function
export const getLongestHabitStreak = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id']
): Promise<Streak> => {
  const { data, error } = await supabase.rpc('get_longest_streak', {
    p_habit_id: habitId,
    p_time_zone: getLocalTimeZone(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const getHabitsStats = async (
  supabase: TypedSupabaseClient,
  habitIds: Habit['id'][],
  timeZone: string
) => {
  const { data, error } = await supabase.rpc('get_habits_stats', {
    p_habit_ids: habitIds,
    p_time_zone: timeZone, // TODO: replace with preferred timezone from to be created user settings table
  });

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};
