import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

export type OccurrenceStockUsage = CamelCasedPropertiesDeep<
  Tables<'occurrence_stock_usages'>
>;

export type OccurrenceStockUsageInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrence_stock_usages'>
>;

export type OccurrenceStockUsageUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'occurrence_stock_usages'>
>;
