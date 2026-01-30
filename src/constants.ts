import type { MetricPreset } from '@models';
import { StorageBuckets } from '@models';

export const MAX_FILE_SIZE_MB = {
  [StorageBuckets.HABIT_ICONS]: 0.1,
  [StorageBuckets.OCCURRENCE_PHOTOS]: 5,
};

export const ALLOWED_IMAGE_TYPES = {
  [StorageBuckets.HABIT_ICONS]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
  ],
  [StorageBuckets.OCCURRENCE_PHOTOS]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
  ],
};

export enum ThemeModes {
  LIGHT = 'light',
  SYSTEM = 'system',
  DARK = 'dark',
}

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
