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

export type NumericMetricValue = { numericValue: number };
export type DurationMetricValue = { durationMs: number };
export type RangeMetricValue = { rangeFrom: number; rangeTo: number };
export type SingleChoiceMetricValue = { selectedOption: string };
export type MultiChoiceMetricValue = { selectedOptions: string[] };
export type BooleanMetricValue = { booleanValue: boolean };
export type TextMetricValue = { textValue: string };

export type MetricConfigByType = {
  boolean: BooleanMetricConfig;
  choice: ChoiceMetricConfig;
  duration: DurationMetricConfig;
  number: NumberMetricConfig;
  percentage: PercentageMetricConfig;
  range: RangeMetricConfig;
  scale: ScaleMetricConfig;
  text: TextMetricConfig;
};

export type MetricValueByType = {
  boolean: BooleanMetricValue;
  choice: SingleChoiceMetricValue | MultiChoiceMetricValue;
  duration: DurationMetricValue;
  number: NumericMetricValue;
  percentage: NumericMetricValue;
  range: RangeMetricValue;
  scale: NumericMetricValue;
  text: TextMetricValue;
};

/**
 * MetricConfig is a discriminated union keyed on `type` — narrowing `metric.type` narrows
 * `metric.config`. MetricValue stays a STRUCTURAL union: value sites have no co-located `type`,
 * so it is narrowed through `matchMetricValue` or `in` checks, never by a discriminant.
 */
export type MetricConfig = MetricConfigByType[MetricType];
export type MetricValue = MetricValueByType[MetricType];

export type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

type BaseHabitMetric = CamelCasedPropertiesDeep<Tables<'habit_metrics'>>;

export type HabitMetric = {
  [T in MetricType]: Omit<BaseHabitMetric, 'config' | 'type'> & {
    config: MetricConfigByType[T];
    type: T;
  };
}[MetricType];

/**
 * Transient form state for editing a metric definition. `config` is the plain `MetricConfig` union
 * (not discriminated by `type`) because `type` and `config` change independently while the user
 * edits — the config/value input dispatchers re-narrow `config` from `type` at render time via
 * runtime predicates.
 */
export type FormMetricDefinitions = {
  config: MetricConfig;
  id: string;
  isBeingEdited?: boolean;
  isPersisted?: boolean;
  isRequired: boolean;
  isToBeAdded?: boolean;
  isToBeRemoved?: boolean;
  isToBeUpdated?: boolean;
  name: string;
  presetName: string;
  sortOrder: number;
  type: MetricType;
};

type BaseHabitMetricInsert = CamelCasedPropertiesDeep<
  TablesInsert<'habit_metrics'>
>;

export type HabitMetricInsert = {
  [T in MetricType]: Omit<BaseHabitMetricInsert, 'config' | 'type'> & {
    config: MetricConfigByType[T];
    type: T;
  };
}[MetricType];

export type HabitMetricUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'habit_metrics'>
>;

export type OccurrenceMetricValue = Omit<
  CamelCasedPropertiesDeep<Tables<'occurrence_metric_values'>>,
  'value'
> & {
  value: MetricValue;
};

export type OccurrenceMetricValueInsert = Omit<
  CamelCasedPropertiesDeep<TablesInsert<'occurrence_metric_values'>>,
  'value'
> & {
  value: MetricValue;
};

export type MetricPreset = {
  [T in MetricType]: {
    config: MetricConfigByType[T];
    name: string;
    type: T;
  };
}[MetricType];
