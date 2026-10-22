import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  TypedSupabaseClient,
  OccurrenceStockUsage,
  OccurrenceStockUsageInsert,
  OccurrenceStockUsageUpdate,
} from '@models';

export const createOccurrenceStockUsages = async (
  supabase: TypedSupabaseClient,
  usages: OccurrenceStockUsageInsert[]
): Promise<OccurrenceStockUsage[]> => {
  if (usages.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('occurrence_stock_usages')
    .insert(
      usages.map((usage) => {
        return decamelizeKeys(usage);
      })
    )
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const updateOccurrenceStockUsage = async (
  supabase: TypedSupabaseClient,
  id: string,
  usage: OccurrenceStockUsageUpdate
): Promise<OccurrenceStockUsage> => {
  const { data, error } = await supabase
    .from('occurrence_stock_usages')
    .update(decamelizeKeys(usage))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const deleteOccurrenceStockUsages = async (
  supabase: TypedSupabaseClient,
  ids: string[]
): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('occurrence_stock_usages')
    .delete()
    .in('id', ids);

  if (error) {
    throw new Error(error.message);
  }
};
