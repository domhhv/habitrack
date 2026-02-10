import { toCalendarDate } from '@internationalized/date';

import type {
  HabitMetric,
  HabitMetricInsert,
  HabitMetricUpdate,
  OccurrenceMetricValue,
  OccurrenceMetricValueInsert,
} from '@models';
import {
  patchHabitMetric,
  createHabitMetrics,
  destroyHabitMetric,
  destroyMetricValue,
  upsertMetricValues,
} from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type MetricsSlice = {
  metricsActions: {
    addHabitMetrics: (metrics: HabitMetricInsert[]) => Promise<HabitMetric[]>;
    removeHabitMetric: (id: string, habitId: string) => Promise<void>;
    removeMetricValue: (
      occurrenceId: string,
      habitMetricId: string
    ) => Promise<void>;
    saveMetricValues: (
      values: OccurrenceMetricValueInsert[]
    ) => Promise<OccurrenceMetricValue[]>;
    updateHabitMetric: (id: string, metric: HabitMetricUpdate) => Promise<void>;
  };
};

export const createMetricsSlice: SliceCreator<keyof MetricsSlice> = (set) => {
  return {
    metricsActions: {
      addHabitMetrics: async (metrics: HabitMetricInsert[]) => {
        if (metrics.length === 0) {
          return [];
        }

        const newMetrics = await createHabitMetrics(metrics);

        set((state) => {
          for (const newMetric of newMetrics) {
            state.habits[newMetric.habitId].metricDefinitions.push(newMetric);

            const habitOccurrences = state.occurrences.filter((occ) => {
              return occ.habitId === newMetric.habitId;
            });

            for (const occurrence of habitOccurrences) {
              occurrence.habit.metricDefinitions.push(newMetric);
              const occurrenceInDateMap =
                state.occurrencesByDate[
                  toCalendarDate(occurrence.occurredAt).toString()
                ];

              if (occurrenceInDateMap && occurrenceInDateMap[occurrence.id]) {
                occurrenceInDateMap[occurrence.id].habit.metricDefinitions.push(
                  newMetric
                );
              }
            }
          }
        });

        return newMetrics;
      },

      removeHabitMetric: async (id: string, habitId: string) => {
        await destroyHabitMetric(id);

        set((state) => {
          const habit = state.habits[habitId];

          habit.metricDefinitions = habit.metricDefinitions.filter((m) => {
            return m.id !== id;
          });

          const habitOccurrences = state.occurrences.filter((occ) => {
            return occ.habitId === habitId;
          });

          for (const occurrence of habitOccurrences) {
            occurrence.metricValues = occurrence.metricValues.filter((mv) => {
              return mv.habitMetricId !== id;
            });
            occurrence.habit.metricDefinitions =
              occurrence.habit.metricDefinitions.filter((m) => {
                return m.id !== id;
              });

            const occurrenceInDateMap =
              state.occurrencesByDate[
                toCalendarDate(occurrence.occurredAt).toString()
              ];

            if (occurrenceInDateMap && occurrenceInDateMap[occurrence.id]) {
              occurrenceInDateMap[occurrence.id].metricValues =
                occurrenceInDateMap[occurrence.id].metricValues.filter((mv) => {
                  return mv.habitMetricId !== id;
                });

              occurrenceInDateMap[occurrence.id].habit.metricDefinitions =
                occurrenceInDateMap[
                  occurrence.id
                ].habit.metricDefinitions.filter((m) => {
                  return m.id !== id;
                });
            }
          }
        });
      },

      removeMetricValue: async (
        occurrenceId: string,
        habitMetricId: string
      ) => {
        await destroyMetricValue(occurrenceId, habitMetricId);

        set((state) => {
          const occurrence = state.occurrences.find((occ) => {
            return occ.id === occurrenceId;
          });

          if (!occurrence) {
            return;
          }

          occurrence.metricValues = occurrence.metricValues.filter((mv) => {
            return mv.habitMetricId !== habitMetricId;
          });

          const occurrenceInDateMap =
            state.occurrencesByDate[
              toCalendarDate(occurrence.occurredAt).toString()
            ];

          if (occurrenceInDateMap && occurrenceInDateMap[occurrenceId]) {
            occurrenceInDateMap[occurrenceId].metricValues =
              occurrenceInDateMap[occurrenceId].metricValues.filter((mv) => {
                return mv.habitMetricId !== habitMetricId;
              });
          }
        });
      },

      saveMetricValues: async (values: OccurrenceMetricValueInsert[]) => {
        const savedValues = await upsertMetricValues(values);

        set((state) => {
          for (const value of savedValues) {
            const occId = value.occurrenceId;

            const occurrence = state.occurrences.find((occ) => {
              return occ.id === occId;
            });

            if (!occurrence) {
              continue;
            }

            const occurrenceInDateMap =
              state.occurrencesByDate[
                toCalendarDate(occurrence.occurredAt).toString()
              ];

            if (!occurrenceInDateMap || !occurrenceInDateMap[occId]) {
              continue;
            }

            occurrence.metricValues = savedValues;
            occurrenceInDateMap[occId].metricValues = savedValues;
          }
        });

        return savedValues;
      },

      updateHabitMetric: async (id: string, metric: HabitMetricUpdate) => {
        const updated = await patchHabitMetric(id, metric);

        set((state) => {
          state.habits[updated.habitId].metricDefinitions = state.habits[
            updated.habitId
          ].metricDefinitions.map((m) => {
            if (m.id === id) {
              return updated;
            }

            return m;
          });
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
