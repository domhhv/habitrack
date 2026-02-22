import { Constants } from '@db-types';
import type { MetricPreset } from '@models';
import { StorageBuckets } from '@models';

export const DAYS_OF_WEEK = Constants.public.Enums.days_of_week;

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

export const METRIC_PRESETS: {
  group: string;
  presets: MetricPreset[];
}[] = [
  {
    group: 'Duration',
    presets: [
      {
        config: { format: 'hh:mm:ss' },
        name: 'Hours, minutes and seconds (hh:mm:ss)',
        type: 'duration',
      },
      {
        config: { format: 'hh:mm' },
        name: 'Hours and minutes (hh:mm)',
        type: 'duration',
      },
      {
        config: { format: 'mm:ss' },
        name: 'Minutes and seconds (mm:ss)',
        type: 'duration',
      },
      { config: { format: 'hours' }, name: 'Hours (h)', type: 'duration' },
      { config: { format: 'minutes' }, name: 'Minutes (m)', type: 'duration' },
      { config: { format: 'seconds' }, name: 'Seconds (s)', type: 'duration' },
    ],
  },
  {
    group: 'Distance',
    presets: [
      {
        config: { preset: 'distance', unit: 'm' },
        name: 'Meters (m)',
        type: 'number',
      },
      {
        config: { preset: 'distance', unit: 'km' },
        name: 'Kilometers (km)',
        type: 'number',
      },
      {
        config: { preset: 'distance', unit: 'yd' },
        name: 'Yards (yd)',
        type: 'number',
      },
      {
        config: { preset: 'distance', unit: 'mi' },
        name: 'Miles (mi)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Weight',
    presets: [
      {
        config: { preset: 'weight', unit: 'mg' },
        name: 'Milligrams (mg)',
        type: 'number',
      },
      {
        config: { preset: 'weight', unit: 'g' },
        name: 'Grams (g)',
        type: 'number',
      },
      {
        config: { preset: 'weight', unit: 'kg' },
        name: 'Kilograms (kg)',
        type: 'number',
      },
      {
        config: { preset: 'weight', unit: 'lb' },
        name: 'Pounds (lb)',
        type: 'number',
      },
      {
        config: { preset: 'weight', unit: 'oz' },
        name: 'Ounces (oz)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Volume',
    presets: [
      {
        config: { preset: 'volume', unit: 'ml' },
        name: 'Milliliters (ml)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'l' },
        name: 'Liters (l)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'qt' },
        name: 'Quarts (qt)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'pt' },
        name: 'Pints (pt)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'gal' },
        name: 'Gallons (gal)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'tsp' },
        name: 'Teaspoons (tsp)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'tbs' },
        name: 'Tablespoons (tbs)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'cup' },
        name: 'Cups (c)',
        type: 'number',
      },
      {
        config: { preset: 'volume', unit: 'fl oz' },
        name: 'Fluid ounces (fl oz)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Temperature',
    presets: [
      {
        config: { preset: 'temperature', unit: 'F' },
        name: 'Degrees Fahrenheit (°F)',
        type: 'number',
      },
      {
        config: { preset: 'temperature', unit: 'C' },
        name: 'Degrees Celsius (°C)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Cadence',
    presets: [
      {
        config: { preset: 'cadence', unit: 'spm' },
        name: 'Steps per minute (SPM)',
        type: 'number',
      },
      {
        config: { preset: 'cadence', unit: 'rpm' },
        name: 'Revolutions per minute (RPM)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Speed',
    presets: [
      {
        config: { preset: 'speed', unit: 'km/h' },
        name: 'Kilometers per hour (km/h)',
        type: 'number',
      },
      {
        config: { preset: 'speed', unit: 'mph' },
        name: 'Miles per hour (mph)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Pace',
    presets: [
      {
        config: { preset: 'pace', unit: 'min/mi' },
        name: 'Minutes per mile (mm:ss/mi)',
        type: 'number',
      },
      {
        config: { preset: 'pace', unit: 'min/km' },
        name: 'Minutes per kilometer (mm:ss/km)',
        type: 'number',
      },
      {
        config: { preset: 'pace', unit: 'min/100m' },
        name: 'Minutes per 100 meters (mm:ss/100m)',
        type: 'number',
      },
      {
        config: { preset: 'pace', unit: 'min/100yd' },
        name: 'Minutes per 100 yards (mm:ss/100yd)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Fitness',
    presets: [
      {
        config: { preset: 'count', unit: 'reps' },
        name: 'Repetitions (reps)',
        type: 'number',
      },
      {
        config: { preset: 'count', unit: 'sets' },
        name: 'Sets',
        type: 'number',
      },
      {
        config: { preset: 'calories', unit: 'cal' },
        name: 'Calories (cal)',
        type: 'number',
      },
      {
        config: { preset: 'calories', unit: 'kcal' },
        name: 'Kilocalories (kcal)',
        type: 'number',
      },
      {
        config: { preset: 'heartRate', unit: 'bpm' },
        name: 'Heart rate (bpm)',
        type: 'number',
      },
      {
        config: { preset: 'vo2max', unit: 'ml/kg/min' },
        name: 'VO₂ max',
        type: 'number',
      },
      {
        config: { preset: 'power', unit: 'W' },
        name: 'Watts (W)',
        type: 'number',
      },
    ],
  },
  {
    group: 'Miscellaneous',
    presets: [
      {
        config: { max: 10, min: 1, step: 1 },
        name: 'Scale (1-10)',
        type: 'scale',
      },
      // TODO: Implement label inputs when adding/editing habits
      // {
      //   name: 'Labeled scale (1-5)',
      //   type: 'scale',
      //   config: {
      //     max: 5,
      //     min: 1,
      //     step: 1,
      //     labels: {
      //       '1': 'Awful',
      //       '2': 'Bad',
      //       '3': 'Okay',
      //       '4': 'Good',
      //       '5': 'Great',
      //     },
      //   },
      // },
      { config: {}, name: 'Number range', type: 'range' },
      { config: {}, name: 'Percentage (%)', type: 'percentage' },
      { config: {}, name: 'Yes/No', type: 'boolean' },
      { config: {}, name: 'Custom', type: 'number' },
    ],
  },
];
