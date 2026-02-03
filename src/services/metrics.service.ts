import decamelizeKeys from 'decamelize-keys';

import type {
  HabitMetric,
  HabitMetricInsert,
  HabitMetricUpdate,
  OccurrenceMetricValue,
  OccurrenceMetricValueInsert,
} from '@models';
import { supabaseClient, deepCamelcaseKeys, deepCamelcaseArray } from '@utils';

export const createHabitMetric = async (
  body: HabitMetricInsert
): Promise<HabitMetric> => {
  const { data, error } = await supabaseClient
    .from('habit_metrics')
    .insert(decamelizeKeys(body))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseKeys<HabitMetric>(data);
};

export const patchHabitMetric = async (
  id: string,
  body: HabitMetricUpdate
): Promise<HabitMetric> => {
  const { data, error } = await supabaseClient
    .from('habit_metrics')
    .update(decamelizeKeys(body))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseKeys<HabitMetric>(data);
};

export const destroyHabitMetric = async (id: string) => {
  const { error } = await supabaseClient
    .from('habit_metrics')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const upsertMetricValues = async (
  values: OccurrenceMetricValueInsert[]
): Promise<OccurrenceMetricValue[]> => {
  if (values.length === 0) {
    return [];
  }

  const { data, error } = await supabaseClient
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

  return deepCamelcaseArray<OccurrenceMetricValue>(data);
};

export const destroyMetricValue = async (
  occurrenceId: string,
  habitMetricId: string
) => {
  const { error } = await supabaseClient
    .from('occurrence_metric_values')
    .delete()
    .eq('occurrence_id', occurrenceId)
    .eq('habit_metric_id', habitMetricId);

  if (error) {
    throw new Error(error.message);
  }
};
