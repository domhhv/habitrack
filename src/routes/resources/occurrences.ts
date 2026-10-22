import { getLocalTimeZone } from '@internationalized/date';
import { data } from 'react-router';

import {
  StorageBuckets,
  type RawOccurrence,
  type TypedSupabaseClient,
  type OccurrenceSubmission,
  type OccurrenceValuesSubmission,
} from '@models';
import {
  getHabit,
  createNote,
  updateNote,
  patchStock,
  destroyNote,
  uploadImages,
  getOccurrence,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
  clearCalendarData,
  destroyMetricValue,
  upsertMetricValues,
  updateOccurrenceStockUsage,
  createOccurrenceStockUsages,
  deleteOccurrenceStockUsages,
} from '@services';
import {
  rollbar,
  runAction,
  userContext,
  getErrorMessage,
  supabaseContext,
  calculateOccurrenceCost,
} from '@utils';

import type { Route } from './+types/occurrences';

const readValues = (formData: FormData) => {
  return JSON.parse(
    String(formData.get('values') ?? '{}')
  ) as OccurrenceValuesSubmission;
};

const photoPathsWrites = new Map<RawOccurrence['id'], Promise<void>>();

/**
 * Serializes read-modify-write updates of an occurrence's `photo_paths`, so concurrent photo
 * removals and entry updates in this tab never overwrite each other's changes.
 */
const writePhotoPaths = (
  supabase: TypedSupabaseClient,
  occurrenceId: RawOccurrence['id'],
  getNextPhotoPaths: (photoPaths: string[]) => string[],
  changes: Parameters<typeof patchOccurrence>[2] = {}
) => {
  const write = (photoPathsWrites.get(occurrenceId) ?? Promise.resolve()).then(
    async () => {
      const occurrence = await getOccurrence(supabase, occurrenceId);
      const photoPaths = getNextPhotoPaths(occurrence?.photoPaths ?? []);

      await patchOccurrence(supabase, occurrenceId, {
        ...changes,
        photoPaths: photoPaths.length > 0 ? photoPaths : null,
      });
    }
  );
  const settled = write.catch(() => {
    return undefined;
  });

  photoPathsWrites.set(occurrenceId, settled);
  void settled.then(() => {
    if (photoPathsWrites.get(occurrenceId) === settled) {
      photoPathsWrites.delete(occurrenceId);
    }
  });

  return write;
};

const uploadPhotos = (
  supabase: TypedSupabaseClient,
  formData: FormData,
  userId: string,
  habitId: string
) => {
  const photos = formData.getAll('photos').filter((photo): photo is File => {
    return typeof photo !== 'string';
  });

  return photos.length > 0
    ? uploadImages(
        supabase,
        StorageBuckets.OCCURRENCE_PHOTOS,
        userId,
        photos,
        habitId
      )
    : Promise.resolve([]);
};

const getCost = async (
  supabase: TypedSupabaseClient,
  { selectedHabitId, stockUsages }: OccurrenceValuesSubmission
) => {
  const habit = await getHabit(supabase, selectedHabitId);

  return calculateOccurrenceCost(habit?.stocks ?? [], stockUsages);
};

const saveMetricValues = (
  supabase: TypedSupabaseClient,
  { metricValues }: OccurrenceValuesSubmission,
  occurrenceId: string,
  userId: string
) => {
  return upsertMetricValues(
    supabase,
    Object.entries(metricValues).map(([habitMetricId, value]) => {
      return { habitMetricId, occurrenceId, userId, value };
    })
  );
};

const markStocksDepleted = (
  supabase: TypedSupabaseClient,
  { depletedStockIds }: OccurrenceValuesSubmission
) => {
  return Promise.all(
    depletedStockIds.map((stockId) => {
      return patchStock(supabase, stockId, { isDepleted: true });
    })
  );
};

const saveOccurrenceNote = async (
  supabase: TypedSupabaseClient,
  occurrenceId: string,
  content: string,
  noteId: string | null,
  userId: string
) => {
  if (content && noteId) {
    await updateNote(supabase, noteId, { content, occurrenceId });
  } else if (content) {
    await createNote(supabase, { content, occurrenceId, userId });
  } else if (noteId) {
    await destroyNote(supabase, noteId);
  }
};

const syncStockUsages = async (
  supabase: TypedSupabaseClient,
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
    supabase,
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
        ? [updateOccurrenceStockUsage(supabase, existing.id, { quantity })]
        : [];
    })
  );

  await createOccurrenceStockUsages(
    supabase,
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

const addOccurrence = async (
  supabase: TypedSupabaseClient,
  formData: FormData,
  userId: string
) => {
  const values = readValues(formData);
  const photoPaths = await uploadPhotos(
    supabase,
    formData,
    userId,
    values.selectedHabitId
  );
  const { cost, currency } = await getCost(supabase, values);
  const occurrence = await createOccurrence(supabase, {
    cost,
    currency,
    habitId: values.selectedHabitId,
    hasSpecificTime: values.hasSpecificTime,
    occurredAt: values.occurredAt,
    photoPaths: photoPaths.length > 0 ? photoPaths : null,
    timeZone: getLocalTimeZone(),
    userId,
  });

  await saveOccurrenceNote(supabase, occurrence.id, values.note, null, userId);
  await saveMetricValues(supabase, values, occurrence.id, userId);
  await createOccurrenceStockUsages(
    supabase,
    values.stockUsages.map(({ habitStockId, quantity }) => {
      return { habitStockId, occurrenceId: occurrence.id, quantity, userId };
    })
  );
  await markStocksDepleted(supabase, values);
};

const updateOccurrence = async (
  supabase: TypedSupabaseClient,
  formData: FormData,
  userId: string
) => {
  const occurrence = await getOccurrence(
    supabase,
    String(formData.get('occurrenceId') ?? '')
  );

  if (!occurrence) {
    throw new Error('This entry no longer exists');
  }

  const values = readValues(formData);
  const noteId = formData.get('noteId');
  const uploadedPhotoPaths = await uploadPhotos(
    supabase,
    formData,
    userId,
    values.selectedHabitId
  );
  const { cost, currency } = await getCost(supabase, values);

  await syncStockUsages(supabase, occurrence, values, userId);
  await markStocksDepleted(supabase, values);
  await writePhotoPaths(
    supabase,
    occurrence.id,
    (photoPaths) => {
      return photoPaths.concat(uploadedPhotoPaths);
    },
    {
      cost,
      currency,
      habitId: values.selectedHabitId,
      hasSpecificTime: values.hasSpecificTime,
      occurredAt: values.occurredAt,
      userId,
    }
  );
  await saveOccurrenceNote(
    supabase,
    occurrence.id,
    values.note,
    typeof noteId === 'string' && noteId ? noteId : null,
    userId
  );
  await saveMetricValues(supabase, values, occurrence.id, userId);
};

const deleteOccurrence = async (
  supabase: TypedSupabaseClient,
  occurrenceId: string
) => {
  const occurrence = await getOccurrence(supabase, occurrenceId);

  if (occurrence) {
    await destroyOccurrence(supabase, occurrence);
  }
};

const removePhoto = (
  supabase: TypedSupabaseClient,
  occurrenceId: string,
  photoPath: string
) => {
  return writePhotoPaths(supabase, occurrenceId, (photoPaths) => {
    return photoPaths.filter((path) => {
      return path !== photoPath;
    });
  });
};

export const clientAction = async ({
  context,
  request,
}: Route.ClientActionArgs) => {
  const supabase = context.get(supabaseContext);
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
          updateOccurrence(supabase, formData, user.id).finally(
            clearCalendarData
          ),
          'update_occurrence'
        )
      : runAction(
          addOccurrence(supabase, formData, user.id).finally(clearCalendarData),
          'add_occurrence'
        );
  }

  const submission = (await request.json()) as OccurrenceSubmission;

  switch (submission.intent) {
    case 'delete':
      return runAction(
        deleteOccurrence(supabase, submission.occurrenceId).finally(
          clearCalendarData
        ),
        'remove_occurrence'
      );

    case 'remove-metric-value':
      return runAction(
        destroyMetricValue(
          supabase,
          submission.occurrenceId,
          submission.habitMetricId
        ).finally(clearCalendarData),
        'remove_metric-value'
      );

    case 'remove-photo':
      try {
        await removePhoto(
          supabase,
          submission.occurrenceId,
          submission.photoPath
        );

        return { ok: true as const };
      } catch (error) {
        rollbar.error(
          error instanceof Error ? error : new Error(getErrorMessage(error))
        );

        return { error: getErrorMessage(error), ok: false as const };
      } finally {
        clearCalendarData();
      }
  }
};
