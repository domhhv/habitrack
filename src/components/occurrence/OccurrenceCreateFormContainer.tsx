import { getLocalTimeZone } from '@internationalized/date';
import React from 'react';

import type {
  MetricValue,
  OccurrenceStockUsageInsert,
  OccurrenceMetricValueInsert,
} from '@models';
import { StorageBuckets } from '@models';
import { uploadImages, createOccurrenceStockUsages } from '@services';
import {
  useUser,
  useHabits,
  useStocks,
  useNoteActions,
  useMetricsActions,
  useOccurrenceActions,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrenceFormView, {
  type OccurrenceFormValues,
} from './OccurrenceFormView';

const OccurrenceCreateFormContainer = () => {
  const timeZone = getLocalTimeZone();
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { dayToLog } = useOccurrenceDrawerState();
  const user = useUser();
  const habits = useHabits();
  const stocks = useStocks();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote } = useNoteActions();
  const { addOccurrence } = useOccurrenceActions();
  const { saveMetricValues } = useMetricsActions();

  const buildMetricInserts = (
    metricValues: Record<string, MetricValue | undefined>,
    occurrenceId: string,
    userId: string
  ): OccurrenceMetricValueInsert[] => {
    return Object.entries(metricValues)
      .filter(([, val]) => {
        return val !== undefined;
      })
      .map(([metricId, val]) => {
        return {
          habitMetricId: metricId,
          occurrenceId,
          userId,
          value: val as MetricValue,
        };
      });
  };

  const handleSubmit = async (values: OccurrenceFormValues) => {
    if (!user || !dayToLog) {
      return;
    }

    const {
      hasSpecificTime,
      metricValues,
      note,
      occurredAt,
      selectedHabitId,
      stockUsages,
      uploadedFiles,
    } = values;

    setIsSaving(true);

    const photoPaths = uploadedFiles.length
      ? await uploadImages(
          StorageBuckets.OCCURRENCE_PHOTOS,
          user.id,
          uploadedFiles,
          selectedHabitId
        )
      : null;

    const addPromise = async () => {
      const stockUsageInserts: OccurrenceStockUsageInsert[] = stockUsages.map(
        (usage) => {
          return {
            habitStockId: usage.habitStockId,
            occurrenceId: '',
            quantity: usage.quantity ?? null,
            userId: user.id,
          };
        }
      );

      const costEntries = stockUsageInserts
        .map((usage) => {
          const stock = stocks[usage.habitStockId];

          if (
            !stock ||
            stock.cost === null ||
            stock.totalItems === null ||
            usage.quantity === null
          ) {
            return null;
          }

          return {
            amount: (stock.cost / stock.totalItems) * (usage?.quantity ?? 0),
            currency: stock.currency,
          };
        })
        .filter((entry) => {
          return entry !== null;
        }) as { amount: number; currency: string }[];

      let cost: number | null = null;
      let currency: string | null = null;

      if (costEntries.length > 0) {
        const currencies = new Set(
          costEntries.map((entry) => {
            return entry.currency;
          })
        );

        if (currencies.size === 1) {
          cost = costEntries.reduce((sum, entry) => {
            return sum + entry.amount;
          }, 0);
          currency = costEntries[0].currency;
        }
      }

      const newOccurrence = await addOccurrence({
        cost,
        currency,
        habitId: selectedHabitId,
        hasSpecificTime,
        occurredAt,
        photoPaths,
        timeZone,
        userId: user.id,
      });

      if (note) {
        await addNote({
          content: note,
          occurrenceId: newOccurrence.id,
          userId: user.id,
        });
      }

      const metricInserts = buildMetricInserts(
        metricValues,
        newOccurrence.id,
        user.id
      );

      if (metricInserts.length > 0) {
        await saveMetricValues(metricInserts);
      }

      if (stockUsageInserts.length > 0) {
        await createOccurrenceStockUsages(
          stockUsageInserts.map((usage) => {
            return { ...usage, occurrenceId: newOccurrence.id };
          })
        );
      }
    };

    void handleAsyncAction(addPromise(), 'add_occurrence', setIsSaving).then(
      closeOccurrenceDrawer
    );
  };

  if (!dayToLog) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      isSaving={isSaving}
      dayToLog={dayToLog}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
    />
  );
};

export default OccurrenceCreateFormContainer;
