import keyBy from 'lodash.keyby';

import type {
  HabitMetric,
  HabitMetricInsert,
  HabitMetricUpdate,
  OccurrenceMetricValue,
  OccurrenceMetricValueInsert,
} from '@models';
import {
  listHabitMetrics,
  listMetricValues,
  patchHabitMetric,
  createHabitMetric,
  destroyHabitMetric,
  upsertMetricValues,
} from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type MetricsSlice = {
  habitMetrics: Record<string, Record<string, HabitMetric>>;
  occurrenceMetricValues: Record<string, Record<string, OccurrenceMetricValue>>;
  metricsActions: {
    addHabitMetric: (metric: HabitMetricInsert) => Promise<HabitMetric>;
    clearMetrics: () => void;
    fetchHabitMetrics: (habitId: string) => Promise<void>;
    fetchMetricValues: (occurrenceId: string) => Promise<void>;
    removeHabitMetric: (id: string, habitId: string) => Promise<void>;
    saveMetricValues: (
      values: OccurrenceMetricValueInsert[]
    ) => Promise<OccurrenceMetricValue[]>;
    updateHabitMetric: (id: string, metric: HabitMetricUpdate) => Promise<void>;
  };
};

export const createMetricsSlice: SliceCreator<keyof MetricsSlice> = (
  set,
  getState
) => {
  return {
    habitMetrics: {},
    occurrenceMetricValues: {},

    metricsActions: {
      addHabitMetric: async (metric: HabitMetricInsert) => {
        const newMetric = await createHabitMetric(metric);

        set((state) => {
          const habitId = newMetric.habitId;

          if (!state.habitMetrics[habitId]) {
            state.habitMetrics[habitId] = {};
          }

          state.habitMetrics[habitId][newMetric.id] = newMetric;
        });

        return newMetric;
      },

      clearMetrics: () => {
        set((state) => {
          state.habitMetrics = {};
          state.occurrenceMetricValues = {};
        });
      },

      fetchHabitMetrics: async (habitId: string) => {
        const { habitMetrics } = getState();

        if (habitMetrics[habitId]) {
          return;
        }

        const metrics = await listHabitMetrics(habitId);

        set((state) => {
          state.habitMetrics[habitId] = keyBy(metrics, 'id');
        });
      },

      fetchMetricValues: async (occurrenceId: string) => {
        const { occurrenceMetricValues } = getState();

        if (occurrenceMetricValues[occurrenceId]) {
          return;
        }

        const values = await listMetricValues(occurrenceId);

        set((state) => {
          state.occurrenceMetricValues[occurrenceId] = keyBy(
            values,
            'habitMetricId'
          );
        });
      },

      removeHabitMetric: async (id: string, habitId: string) => {
        await destroyHabitMetric(id);

        set((state) => {
          if (state.habitMetrics[habitId]) {
            delete state.habitMetrics[habitId][id];
          }
        });
      },

      saveMetricValues: async (values: OccurrenceMetricValueInsert[]) => {
        const savedValues = await upsertMetricValues(values);

        set((state) => {
          for (const value of savedValues) {
            const occId = value.occurrenceId;

            if (!state.occurrenceMetricValues[occId]) {
              state.occurrenceMetricValues[occId] = {};
            }

            state.occurrenceMetricValues[occId][value.habitMetricId] = value;
          }
        });

        return savedValues;
      },

      updateHabitMetric: async (id: string, metric: HabitMetricUpdate) => {
        const updated = await patchHabitMetric(id, metric);

        set((state) => {
          const habitId = updated.habitId;

          if (state.habitMetrics[habitId]) {
            state.habitMetrics[habitId][id] = updated;
          }
        });
      },
    },
  };
};

export const useMetricsActions = () => {
  return useBoundStore((state) => {
    return state.metricsActions;
  });
};
