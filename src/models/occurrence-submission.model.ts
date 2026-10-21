import type { MetricValue } from './metric.model';

export type OccurrenceFormValues = {
  depletedStockIds: string[];
  hasSpecificTime: boolean;
  metricValues: Record<string, MetricValue | undefined>;
  note: string;
  occurredAt: string;
  selectedHabitId: string;
  stockUsages: { habitStockId: string; quantity: number | null }[];
  uploadedFiles: File[];
};

export type OccurrenceValuesSubmission = Omit<
  OccurrenceFormValues,
  'metricValues' | 'uploadedFiles'
> & {
  metricValues: Record<string, MetricValue>;
};

export type OccurrenceSubmission =
  | { intent: 'delete'; occurrenceId: string }
  | { intent: 'remove-photo'; occurrenceId: string; photoPath: string }
  | {
      habitMetricId: string;
      intent: 'remove-metric-value';
      occurrenceId: string;
    };
