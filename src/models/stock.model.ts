import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

import type { MetricValue } from './metric.model';

export type HabitStock = CamelCasedPropertiesDeep<Tables<'habit_stocks'>>;
export type HabitStockInsert = CamelCasedPropertiesDeep<
  TablesInsert<'habit_stocks'>
>;
export type HabitStockUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'habit_stocks'>
>;

export type HabitStockMetricDefault = CamelCasedPropertiesDeep<
  Tables<'habit_stock_metric_defaults'>
>;
export type HabitStockMetricDefaultInsert = CamelCasedPropertiesDeep<
  TablesInsert<'habit_stock_metric_defaults'>
>;

export type HabitStockWithDefaults = HabitStock & {
  metricDefaults: Omit<HabitStockMetricDefault, 'userId' | 'habitStockId'>[];
  usageCount: number;
};

export type StockFormValues = {
  cost: string;
  currency: string;
  metricDefaults: Record<string, MetricValue | undefined>;
  name: string;
  remainingItems: string;
  totalItems: string;
};
