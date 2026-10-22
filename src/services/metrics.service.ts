import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  HabitMetric,
  HabitMetricInsert,
  HabitMetricUpdate,
  TypedSupabaseClient,
  OccurrenceMetricValue,
  OccurrenceMetricValueInsert,
} from '@models';
import { parseHabitMetric, parseMetricValueHolder } from '@utils';

export const createHabitMetrics = async (
  supabase: TypedSupabaseClient,
  metrics: HabitMetricInsert[]
): Promise<HabitMetric[]> => {
  if (metrics.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('habit_metrics')
    .insert(decamelizeKeys(metrics))
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true }).map(parseHabitMetric);
};

export const patchHabitMetric = async (
  supabase: TypedSupabaseClient,
  id: string,
  body: HabitMetricUpdate
): Promise<HabitMetric> => {
  const { data, error } = await supabase
    .from('habit_metrics')
    .update(decamelizeKeys(body))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseHabitMetric(camelcaseKeys(data, { deep: true }));
};

export const destroyHabitMetrics = async (
  supabase: TypedSupabaseClient,
  ids: string[]
) => {
  if (ids.length === 0) {
    return;
  }

  const { error } = await supabase.from('habit_metrics').delete().in('id', ids);

  if (error) {
    throw new Error(error.message);
  }
};

export const upsertMetricValues = async (
  supabase: TypedSupabaseClient,
  values: OccurrenceMetricValueInsert[]
): Promise<OccurrenceMetricValue[]> => {
  if (values.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('occurrence_metric_values')
    .upsert(
      values.map((v) => {
        return decamelizeKeys(v);
      }),
      {
        onConflict: 'occurrence_id,habit_metric_id',
      }
    )
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true }).map(parseMetricValueHolder);
};

export const destroyMetricValue = async (
  supabase: TypedSupabaseClient,
  occurrenceId: string,
  habitMetricId: string
) => {
  const { error } = await supabase
    .from('occurrence_metric_values')
    .delete()
    .eq('occurrence_id', occurrenceId)
    .eq('habit_metric_id', habitMetricId);

  if (error) {
    throw new Error(error.message);
  }
};
