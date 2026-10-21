import { toCalendarDate } from '@internationalized/date';

import type {
  OccurrenceMetricValue,
  OccurrenceMetricValueInsert,
} from '@models';
import { upsertMetricValues, destroyMetricValue } from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type MetricsSlice = {
  metricsActions: {
    removeMetricValue: (
      occurrenceId: string,
      habitMetricId: string
    ) => Promise<void>;
    saveMetricValues: (
      values: OccurrenceMetricValueInsert[]
    ) => Promise<OccurrenceMetricValue[]>;
  };
};

export const createMetricsSlice: SliceCreator<keyof MetricsSlice> = (set) => {
  return {
    metricsActions: {
      removeMetricValue: async (
        occurrenceId: string,
        habitMetricId: string
      ) => {
        await destroyMetricValue(occurrenceId, habitMetricId);

        set(
          (state) => {
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
          },
          undefined,
          'metricsActions.removeMetricValue'
        );
      },

      saveMetricValues: async (values: OccurrenceMetricValueInsert[]) => {
        const savedValues = await upsertMetricValues(values);

        set(
          (state) => {
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
          },
          undefined,
          'metricsActions.saveMetricValues'
        );

        return savedValues;
      },
    },
  };
};

export const useMetricsActions = () => {
  return useBoundStore((state) => {
    return state.metricsActions;
  });
};
