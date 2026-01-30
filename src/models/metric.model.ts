import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

export type MetricType = Tables<'habit_metrics'>['type'];

// Config shapes per metric type

export type NumberMetricConfig = {
  decimalPlaces?: number;
  max?: number;
  min?: number;
  preset?: string;
  unit?: string;
};

export type DurationMetricConfig = {
  format?: 'hh:mm' | 'hh:mm:ss' | 'minutes' | 'seconds';
};

export type PercentageMetricConfig = Record<string, never>;

export type ScaleMetricConfig = {
  labels?: Record<string, string>;
  max: number;
  min: number;
  step: number;
};

export type RangeMetricConfig = {
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

// Value shapes per metric type

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

// DB-backed types

export type HabitMetric = CamelCasedPropertiesDeep<Tables<'habit_metrics'>>;
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
export type OccurrenceMetricValueUpdate = CamelCasedPropertiesDeep<
  TablesUpdate<'occurrence_metric_values'>
>;

// Preset definitions for the UI

export type MetricPreset = {
  config: MetricConfig;
  name: string;
  type: MetricType;
};

export const METRIC_PRESETS: MetricPreset[] = [
  {
    config: { preset: 'distance', unit: 'km' },
    name: 'Distance (km)',
    type: 'number',
  },
  {
    config: { preset: 'distance', unit: 'mi' },
    name: 'Distance (mi)',
    type: 'number',
  },
  { config: { format: 'hh:mm' }, name: 'Duration', type: 'duration' },
  {
    config: { preset: 'calories', unit: 'kcal' },
    name: 'Calories',
    type: 'number',
  },
  {
    config: { preset: 'weight', unit: 'kg' },
    name: 'Weight (kg)',
    type: 'number',
  },
  {
    config: { preset: 'weight', unit: 'lb' },
    name: 'Weight (lb)',
    type: 'number',
  },
  {
    config: { preset: 'volume', unit: 'ml' },
    name: 'Volume (ml)',
    type: 'number',
  },
  {
    config: { preset: 'volume', unit: 'l' },
    name: 'Volume (l)',
    type: 'number',
  },
  {
    config: { preset: 'count', unit: 'reps' },
    name: 'Reps',
    type: 'number',
  },
  {
    config: { preset: 'heartRate', unit: 'bpm' },
    name: 'Heart Rate',
    type: 'number',
  },
  {
    config: { decimalPlaces: 2, preset: 'currency', unit: '$' },
    name: 'Cost ($)',
    type: 'number',
  },
  {
    config: { preset: 'temperature', unit: '°C' },
    name: 'Temperature (°C)',
    type: 'number',
  },
  {
    config: { preset: 'speed', unit: 'km/h' },
    name: 'Speed (km/h)',
    type: 'number',
  },
  { config: {}, name: 'Percentage', type: 'percentage' },
  {
    config: { max: 10, min: 1, step: 1 },
    name: 'Scale (1-10)',
    type: 'scale',
  },
  {
    name: 'Mood (1-5)',
    type: 'scale',
    config: {
      max: 5,
      min: 1,
      step: 1,
      labels: {
        '1': 'Awful',
        '2': 'Bad',
        '3': 'Okay',
        '4': 'Good',
        '5': 'Great',
      },
    },
  },
  { config: { unit: 'pages' }, name: 'Pages (range)', type: 'range' },
  { config: {}, name: 'Yes/No', type: 'boolean' },
];
