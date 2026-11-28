import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables } from '@db-types';

export type OccurrenceStockUsage = CamelCasedPropertiesDeep<
  Tables<'occurrence_stock_usages'>
>;
