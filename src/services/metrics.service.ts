import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  HabitMetric,
  HabitMetricInsert,
  HabitMetricUpdate,
  OccurrenceMetricValue,
  OccurrenceMetricValueInsert,
} from '@models';
import { supabaseClient } from '@utils';

type SnakeRecord = Record<string, unknown>;
type SnakeRecordArray = SnakeRecord[];

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

  return camelcaseKeys(data as SnakeRecord, { deep: true }) as HabitMetric;
};

export const listHabitMetrics = async (
  habitId: string
): Promise<HabitMetric[]> => {
  const { data, error } = await supabaseClient
    .from('habit_metrics')
    .select()
    .eq('habit_id', habitId)
    .order('sort_order');

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data as SnakeRecordArray, {
    deep: true,
  }) as HabitMetric[];
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

  return camelcaseKeys(data as SnakeRecord, { deep: true }) as HabitMetric;
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

export const listMetricValues = async (
  occurrenceId: string
): Promise<OccurrenceMetricValue[]> => {
  const { data, error } = await supabaseClient
    .from('occurrence_metric_values')
    .select()
    .eq('occurrence_id', occurrenceId);

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data as SnakeRecordArray, {
    deep: true,
  }) as OccurrenceMetricValue[];
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

  return camelcaseKeys(data as SnakeRecordArray, {
    deep: true,
  }) as OccurrenceMetricValue[];
};

export const destroyMetricValuesForOccurrence = async (
  occurrenceId: string
) => {
  const { error } = await supabaseClient
    .from('occurrence_metric_values')
    .delete()
    .eq('occurrence_id', occurrenceId);

  if (error) {
    throw new Error(error.message);
  }
};
