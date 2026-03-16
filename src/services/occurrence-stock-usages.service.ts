import decamelizeKeys from 'decamelize-keys';

import type { OccurrenceStockUsage, OccurrenceStockUsageInsert } from '@models';
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
