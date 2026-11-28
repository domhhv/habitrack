import decamelizeKeys from 'decamelize-keys';

import type { TypedSupabaseClient, HabitMetricDefinition } from '@models';

export const toMetricDefinitionRow = (
  definition: HabitMetricDefinition & { id?: string }
) => {
  return decamelizeKeys(definition);
};

export type SaveHabitMetricsParams = {
  added: HabitMetricDefinition[];
  removedIds: string[];
  updated: (HabitMetricDefinition & { id: string })[];
};

export const saveHabitMetrics = async (
  supabase: TypedSupabaseClient,
  habitId: string,
  { added, removedIds, updated }: SaveHabitMetricsParams
) => {
  const { error } = await supabase.rpc('save_habit_metrics', {
    p_added: added.map(toMetricDefinitionRow),
    p_habit_id: habitId,
    p_removed_ids: removedIds,
    p_updated: updated.map(toMetricDefinitionRow),
  });

  if (error) {
    throw new Error(error.message);
  }
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
