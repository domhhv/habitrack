import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

export type MetricType = Tables<'habit_metrics'>['type'];

export type NumberMetricConfig = {
  decimalPlaces?: number;
  max?: number;
  min?: number;
  preset?: string;
  unit?: string;
};

export type DurationMetricConfig = {
  format?: 'hh:mm' | 'hh:mm:ss' | 'mm:ss' | 'hours' | 'minutes' | 'seconds';
};

export type PercentageMetricConfig = Record<string, never>;

export type ScaleMetricConfig = {
  labels?: Record<string, string>;
  max: number;
  min: number;
  step: number;
};

export type RangeMetricConfig = {
  continueFromLast?: boolean;
  max?: number;
  min?: number;
  unit?: string;
};

export type ChoiceMetricConfig = {
  allowMultiple?: boolean;
  options: string[];
};

export type BooleanMetricConfig = {
  falseLabel?: string;
  trueLabel?: string;
};

export type TextMetricConfig = {
  maxLength?: number;
  multiline?: boolean;
  placeholder?: string;
};

export type MetricConfig =
  | BooleanMetricConfig
  | ChoiceMetricConfig
  | DurationMetricConfig
  | NumberMetricConfig
  | PercentageMetricConfig
  | RangeMetricConfig
  | ScaleMetricConfig
  | TextMetricConfig;

export type NumericMetricValue = { numericValue: number };
export type DurationMetricValue = { durationMs: number };
export type RangeMetricValue = { rangeFrom: number; rangeTo: number };
export type SingleChoiceMetricValue = { selectedOption: string };
export type MultiChoiceMetricValue = { selectedOptions: string[] };
export type BooleanMetricValue = { booleanValue: boolean };
export type TextMetricValue = { textValue: string };

export type MetricValue =
  | BooleanMetricValue
  | DurationMetricValue
  | MultiChoiceMetricValue
  | NumericMetricValue
  | RangeMetricValue
  | SingleChoiceMetricValue
  | TextMetricValue;

export type HabitMetric = CamelCasedPropertiesDeep<Tables<'habit_metrics'>>;

export type FormMetricDefinitions = Omit<
  HabitMetric,
  'id' | 'createdAt' | 'updatedAt' | 'config' | 'habitId' | 'userId'
> & {
  config: MetricConfig;
  id: string;
  isBeingEdited?: boolean;
  isPersisted?: boolean;
  isToBeAdded?: boolean;
  isToBeRemoved?: boolean;
  isToBeUpdated?: boolean;
};

export type HabitMetricInsert = CamelCasedPropertiesDeep<
  TablesInsert<'habit_metrics'>
>;
export type HabitMetricUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'habit_metrics'>
>;

export type OccurrenceMetricValue = CamelCasedPropertiesDeep<
  Tables<'occurrence_metric_values'>
>;
export type OccurrenceMetricValueInsert = CamelCasedPropertiesDeep<
  TablesInsert<'occurrence_metric_values'>
>;

export type MetricPreset = {
  config: MetricConfig;
  name: string;
  type: MetricType;
};
