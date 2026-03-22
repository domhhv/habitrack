import React from 'react';

import type {
  MetricValue,
  OccurrenceStockUsageInsert,
  OccurrenceMetricValueInsert,
} from '@models';
import { StorageBuckets } from '@models';
import {
  uploadImages,
  updateOccurrenceStockUsage,
  createOccurrenceStockUsages,
  deleteOccurrenceStockUsages,
} from '@services';
import {
  useUser,
  useHabits,
  useNoteActions,
  useStockActions,
  useMetricsActions,
  useOccurrenceActions,
  useNotesByOccurrenceId,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrenceFormView, {
  type OccurrenceFormValues,
} from './OccurrenceFormView';

const OccurrenceUpdateFormContainer = () => {
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { occurrenceToEdit } = useOccurrenceDrawerState();
  const user = useUser();
  const habits = useHabits();
  const notes = useNotesByOccurrenceId();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const { refreshHabitStocks, updateStock } = useStockActions();
  const { updateOccurrence } = useOccurrenceActions();
  const { saveMetricValues } = useMetricsActions();

  const occurrenceNote = React.useMemo(() => {
    return notes[occurrenceToEdit?.id || ''];
  }, [notes, occurrenceToEdit]);

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
    if (!user || !occurrenceToEdit) {
      return;
    }

    const {
      depletedStockIds,
      hasSpecificTime,
      metricValues,
      note,
      occurredAt,
      selectedHabitId,
      stockUsages,
      uploadedFiles,
    } = values;

    setIsSaving(true);

    const updatePromise = async () => {
      const uploadedPhotoPaths = uploadedFiles.length
        ? await uploadImages(
            StorageBuckets.OCCURRENCE_PHOTOS,
            user.id,
            uploadedFiles,
            selectedHabitId
          )
        : [];

      const photoPaths = (occurrenceToEdit.photoPaths || []).concat(
        uploadedPhotoPaths
      );

      // Determine stock usage cost
      const habitStocks = habits[selectedHabitId]?.stocks ?? [];
      const stocksById = new Map(
        habitStocks.map((s) => {
          return [s.id, s] as const;
        })
      );

      const costEntries = stockUsages
        .map((usage) => {
          const stock = stocksById.get(usage.habitStockId);

          if (
            !stock ||
            stock.cost === null ||
            stock.totalItems === null ||
            usage.quantity === null
          ) {
            return null;
          }

          return {
            amount: (stock.cost / stock.totalItems) * (usage.quantity ?? 0),
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

      // Persist stock usage changes before updating the occurrence
      // so the occurrence refetch includes the latest stock_usages
      const existingUsagesByStockId = new Map(
        occurrenceToEdit.stockUsages.map((usage) => {
          return [usage.habitStockId, usage] as const;
        })
      );

      const newStockIds = new Set(
        stockUsages.map((u) => {
          return u.habitStockId;
        })
      );

      // Delete removed usages (DB triggers restore remaining_items)
      const usagesToDelete = occurrenceToEdit.stockUsages
        .filter((usage) => {
          return !newStockIds.has(usage.habitStockId);
        })
        .map((usage) => {
          return usage.id;
        });

      if (usagesToDelete.length > 0) {
        await deleteOccurrenceStockUsages(usagesToDelete);
      }

      // Update existing usages where quantity changed (DB triggers adjust remaining_items)
      const updatePromises = stockUsages
        .map((usage) => {
          const existing = existingUsagesByStockId.get(usage.habitStockId);

          if (!existing || existing.quantity === usage.quantity) {
            return null;
          }

          return updateOccurrenceStockUsage(existing.id, {
            quantity: usage.quantity,
          });
        })
        .filter((promise) => {
          return promise !== null;
        });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      // Create new usages (DB triggers decrement remaining_items)
      const usagesToCreate: OccurrenceStockUsageInsert[] = stockUsages
        .filter((usage) => {
          return !existingUsagesByStockId.has(usage.habitStockId);
        })
        .map((usage) => {
          return {
            habitStockId: usage.habitStockId,
            occurrenceId: occurrenceToEdit.id,
            quantity: usage.quantity ?? null,
            userId: user.id,
          };
        });

      if (usagesToCreate.length > 0) {
        await createOccurrenceStockUsages(usagesToCreate);
      }

      // Mark stocks as depleted
      if (depletedStockIds.length > 0) {
        await Promise.all(
          depletedStockIds.map((stockId) => {
            return updateStock(stockId, { isDepleted: true }, selectedHabitId);
          })
        );
      }

      // Update the occurrence (refetches with latest stock_usages from DB)
      await updateOccurrence(occurrenceToEdit, {
        cost,
        currency,
        habitId: selectedHabitId,
        hasSpecificTime,
        occurredAt,
        photoPaths: photoPaths.length ? photoPaths : null,
        userId: user.id,
      });

      if (note) {
        if (occurrenceNote) {
          await updateNote(occurrenceNote.id, {
            content: note,
            occurrenceId: occurrenceToEdit.id,
          });
        } else {
          await addNote({
            content: note,
            occurrenceId: occurrenceToEdit.id,
            userId: user.id,
          });
        }
      } else if (occurrenceNote) {
        await deleteNote(occurrenceNote.id);
      }

      const metricInserts = buildMetricInserts(
        metricValues,
        occurrenceToEdit.id,
        user.id
      );

      if (metricInserts.length > 0) {
        await saveMetricValues(metricInserts);
      }

      // Refresh stocks to reflect updated remaining_items from DB triggers
      await refreshHabitStocks(selectedHabitId);
    };

    void handleAsyncAction(
      updatePromise(),
      'update_occurrence',
      setIsSaving
    ).then(closeOccurrenceDrawer);
  };

  const handlePhotoDelete = (path: string) => {
    if (!occurrenceToEdit?.photoPaths) {
      return;
    }

    void updateOccurrence(occurrenceToEdit, {
      photoPaths: occurrenceToEdit.photoPaths.filter((p) => {
        return p !== path;
      }),
    });
  };

  if (!occurrenceToEdit) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
      occurrenceNote={occurrenceNote}
      onPhotoDelete={handlePhotoDelete}
      occurrenceToEdit={occurrenceToEdit}
    />
  );
};

export default OccurrenceUpdateFormContainer;
