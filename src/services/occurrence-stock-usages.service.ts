import decamelizeKeys from 'decamelize-keys';

import type {
  OccurrenceStockUsage,
  OccurrenceStockUsageInsert,
  OccurrenceStockUsageUpdate,
} from '@models';
import { supabaseClient, deepCamelcaseArray } from '@utils';

export const createOccurrenceStockUsages = async (
  usages: OccurrenceStockUsageInsert[]
): Promise<OccurrenceStockUsage[]> => {
  if (usages.length === 0) {
    return [];
  }

  const { data, error } = await supabaseClient
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

  return deepCamelcaseArray<OccurrenceStockUsage>(data);
};

export const updateOccurrenceStockUsage = async (
  id: string,
  usage: OccurrenceStockUsageUpdate
): Promise<OccurrenceStockUsage> => {
  const { data, error } = await supabaseClient
    .from('occurrence_stock_usages')
    .update(decamelizeKeys(usage))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelcaseArray<OccurrenceStockUsage>([data])[0];
};

export const deleteOccurrenceStockUsages = async (
  ids: string[]
): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  const { error } = await supabaseClient
    .from('occurrence_stock_usages')
    .delete()
    .in('id', ids);

  if (error) {
    throw new Error(error.message);
  }
};
