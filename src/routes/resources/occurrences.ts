import { getLocalTimeZone } from '@internationalized/date';
import { data } from 'react-router';

import {
  StorageBuckets,
  type RawOccurrence,
  type OccurrenceSubmission,
  type OccurrenceValuesSubmission,
} from '@models';
import {
  getHabit,
  patchStock,
  uploadImages,
  getOccurrence,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
  destroyMetricValue,
  upsertMetricValues,
  updateOccurrenceStockUsage,
  createOccurrenceStockUsages,
  deleteOccurrenceStockUsages,
} from '@services';
import { useBoundStore, refreshStoreOccurrences } from '@stores';
import {
  rollbar,
  runAction,
  userContext,
  getErrorMessage,
  calculateOccurrenceCost,
} from '@utils';

import type { Route } from './+types/occurrences';

const readValues = (formData: FormData) => {
  return JSON.parse(
    String(formData.get('values') ?? '{}')
  ) as OccurrenceValuesSubmission;
};

const uploadPhotos = (formData: FormData, userId: string, habitId: string) => {
  const photos = formData.getAll('photos').filter((photo): photo is File => {
    return typeof photo !== 'string';
  });

  return photos.length > 0
    ? uploadImages(StorageBuckets.OCCURRENCE_PHOTOS, userId, photos, habitId)
    : Promise.resolve([]);
};

const getCost = async ({
  selectedHabitId,
  stockUsages,
}: OccurrenceValuesSubmission) => {
  const habit = await getHabit(selectedHabitId);

  return calculateOccurrenceCost(habit?.stocks ?? [], stockUsages);
};

const saveMetricValues = (
  { metricValues }: OccurrenceValuesSubmission,
  occurrenceId: string,
  userId: string
) => {
  return upsertMetricValues(
    Object.entries(metricValues).map(([habitMetricId, value]) => {
      return { habitMetricId, occurrenceId, userId, value };
    })
  );
};

const markStocksDepleted = ({
  depletedStockIds,
}: OccurrenceValuesSubmission) => {
  return Promise.all(
    depletedStockIds.map((stockId) => {
      return patchStock(stockId, { isDepleted: true });
    })
  );
};

/* Bridge: remove when note mutations move to /resources/notes. */
const saveOccurrenceNote = async (
  occurrenceId: string,
  content: string,
  noteId: string | null,
  userId: string
) => {
  const { noteActions } = useBoundStore.getState();

  if (content && noteId) {
    await noteActions.updateNote(noteId, { content, occurrenceId });
  } else if (content) {
    await noteActions.addNote({ content, occurrenceId, userId });
  } else if (noteId) {
    await noteActions.deleteNote(noteId);
  }
};

const syncStockUsages = async (
  occurrence: RawOccurrence,
  { stockUsages }: OccurrenceValuesSubmission,
  userId: string
) => {
  const existingUsagesByStockId = new Map(
    occurrence.stockUsages.map((usage) => {
      return [usage.habitStockId, usage];
    })
  );
  const nextStockIds = new Set(
    stockUsages.map(({ habitStockId }) => {
      return habitStockId;
    })
  );

  await deleteOccurrenceStockUsages(
    occurrence.stockUsages
      .filter(({ habitStockId }) => {
        return !nextStockIds.has(habitStockId);
      })
      .map(({ id }) => {
        return id;
      })
  );

  await Promise.all(
    stockUsages.flatMap(({ habitStockId, quantity }) => {
      const existing = existingUsagesByStockId.get(habitStockId);

      return existing && existing.quantity !== quantity
        ? [updateOccurrenceStockUsage(existing.id, { quantity })]
        : [];
    })
  );

  await createOccurrenceStockUsages(
    stockUsages
      .filter(({ habitStockId }) => {
        return !existingUsagesByStockId.has(habitStockId);
      })
      .map(({ habitStockId, quantity }) => {
        return {
          habitStockId,
          occurrenceId: occurrence.id,
          quantity,
          userId,
        };
      })
  );
};

const addOccurrence = async (formData: FormData, userId: string) => {
  const values = readValues(formData);
  const photoPaths = await uploadPhotos(
    formData,
    userId,
    values.selectedHabitId
  );
  const { cost, currency } = await getCost(values);
  const occurrence = await createOccurrence({
    cost,
    currency,
    habitId: values.selectedHabitId,
    hasSpecificTime: values.hasSpecificTime,
    occurredAt: values.occurredAt,
    photoPaths: photoPaths.length > 0 ? photoPaths : null,
    timeZone: getLocalTimeZone(),
    userId,
  });

  await saveOccurrenceNote(occurrence.id, values.note, null, userId);
  await saveMetricValues(values, occurrence.id, userId);
  await createOccurrenceStockUsages(
    values.stockUsages.map(({ habitStockId, quantity }) => {
      return { habitStockId, occurrenceId: occurrence.id, quantity, userId };
    })
  );
  await markStocksDepleted(values);
};

const updateOccurrence = async (formData: FormData, userId: string) => {
  const occurrence = await getOccurrence(
    String(formData.get('occurrenceId') ?? '')
  );

  if (!occurrence) {
    throw new Error('This entry no longer exists');
  }

  const values = readValues(formData);
  const noteId = formData.get('noteId');
  const photoPaths = (occurrence.photoPaths ?? []).concat(
    await uploadPhotos(formData, userId, values.selectedHabitId)
  );
  const { cost, currency } = await getCost(values);

  await syncStockUsages(occurrence, values, userId);
  await markStocksDepleted(values);
  await patchOccurrence(occurrence.id, {
    cost,
    currency,
    habitId: values.selectedHabitId,
    hasSpecificTime: values.hasSpecificTime,
    occurredAt: values.occurredAt,
    photoPaths: photoPaths.length > 0 ? photoPaths : null,
    userId,
  });
  await saveOccurrenceNote(
    occurrence.id,
    values.note,
    typeof noteId === 'string' && noteId ? noteId : null,
    userId
  );
  await saveMetricValues(values, occurrence.id, userId);
};

const deleteOccurrence = async (occurrenceId: string) => {
  const occurrence = await getOccurrence(occurrenceId);

  if (occurrence) {
    await destroyOccurrence(occurrence);
  }
};

const removePhoto = async (occurrenceId: string, photoPath: string) => {
  const occurrence = await getOccurrence(occurrenceId);

  await patchOccurrence(occurrenceId, {
    photoPaths: (occurrence?.photoPaths ?? []).filter((path) => {
      return path !== photoPath;
    }),
  });
};

export const clientAction = async ({
  context,
  request,
}: Route.ClientActionArgs) => {
  const user = context.get(userContext);

  if (!user) {
    return data(
      { error: 'Please log in to your account first', ok: false as const },
      { status: 401 }
    );
  }

  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    const formData = await request.formData();

    return formData.get('intent') === 'update'
      ? runAction(
          updateOccurrence(formData, user.id).then(refreshStoreOccurrences),
          'update_occurrence'
        )
      : runAction(
          addOccurrence(formData, user.id).then(refreshStoreOccurrences),
          'add_occurrence'
        );
  }

  const submission = (await request.json()) as OccurrenceSubmission;

  switch (submission.intent) {
    case 'delete':
      return runAction(
        deleteOccurrence(submission.occurrenceId).then(refreshStoreOccurrences),
        'remove_occurrence'
      );

    case 'remove-metric-value':
      return runAction(
        destroyMetricValue(
          submission.occurrenceId,
          submission.habitMetricId
        ).then(refreshStoreOccurrences),
        'remove_metric-value'
      );

    case 'remove-photo':
      try {
        await removePhoto(submission.occurrenceId, submission.photoPath);
        await refreshStoreOccurrences();

        return { ok: true as const };
      } catch (error) {
        rollbar.error(
          error instanceof Error ? error : new Error(getErrorMessage(error))
        );

        return { error: getErrorMessage(error), ok: false as const };
      }
  }
};
