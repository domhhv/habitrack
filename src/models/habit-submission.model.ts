import type { MetricValue } from './metric.model';

/** The `intent` values the habit details action accepts. */
export type HabitDetailsIntent =
  | 'add-stock'
  | 'delete-habit'
  | 'remove-stock'
  | 'save-metrics'
  | 'set-stock-depleted'
  | 'update-habit'
  | 'update-stock'
  | 'upload-icon';

/** The `metricDefaults` field of the stock forms, posted as JSON. */
export type StockMetricDefaultsSubmission = {
  compound: Record<string, boolean>;
  values: Record<string, MetricValue>;
};
