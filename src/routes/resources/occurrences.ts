import { data } from 'react-router';

import type {
  RawOccurrence,
  TypedSupabaseClient,
  OccurrenceSubmission,
  OccurrenceSaveSubmission,
  OccurrenceValuesSubmission,
} from '@models';
import {
  getHabit,
  createNote,
  updateNote,
  patchStock,
  destroyNote,
  getOccurrence,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
  clearCalendarData,
  destroyMetricValue,
  upsertMetricValues,
  addOccurrencePhotoPaths,
  removeOccurrencePhotoPath,
  updateOccurrenceStockUsage,
  createOccurrenceStockUsages,
  deleteOccurrenceStockUsages,
} from '@services';
import {
  runAction,
  userContext,
  getErrorMessage,
  supabaseContext,
  getRequestTimeZone,
  calculateOccurrenceCost,
} from '@utils';

import type { Route } from './+types/occurrences';

/**
 * Photos upload from the browser into the user's own folder, so the action only accepts paths
 * inside it.
 */
const assertOwnPhotoPaths = (photoPaths: unknown, userId: string) => {
  if (
    !Array.isArray(photoPaths) ||
    !photoPaths.every((path) => {
      return typeof path === 'string' && path.startsWith(`${userId}/`);
    })
  ) {
    throw new Error('Some photos could not be attached to this entry');
  }

  return photoPaths as string[];
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
  {
    photoPaths,
    values,
  }: Extract<OccurrenceSaveSubmission, { intent: 'create' }>,
  userId: string,
  timeZone: string
) => {
  const ownPhotoPaths = assertOwnPhotoPaths(photoPaths, userId);
  const { cost, currency } = await getCost(supabase, values);
  const occurrence = await createOccurrence(supabase, {
    cost,
    currency,
    habitId: values.selectedHabitId,
    hasSpecificTime: values.hasSpecificTime,
    occurredAt: values.occurredAt,
    photoPaths: ownPhotoPaths.length > 0 ? ownPhotoPaths : null,
    timeZone,
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
  {
    noteId,
    occurrenceId,
    photoPaths,
    values,
  }: Extract<OccurrenceSaveSubmission, { intent: 'update' }>,
  userId: string
) => {
  const ownPhotoPaths = assertOwnPhotoPaths(photoPaths, userId);
  const occurrence = await getOccurrence(supabase, occurrenceId);

  if (!occurrence) {
    throw new Error('This entry no longer exists');
  }

  const { cost, currency } = await getCost(supabase, values);

  await syncStockUsages(supabase, occurrence, values, userId);
  await markStocksDepleted(supabase, values);
  await patchOccurrence(supabase, occurrence.id, {
    cost,
    currency,
    habitId: values.selectedHabitId,
    hasSpecificTime: values.hasSpecificTime,
    occurredAt: values.occurredAt,
    userId,
  });

  if (ownPhotoPaths.length > 0) {
    await addOccurrencePhotoPaths(supabase, occurrence.id, ownPhotoPaths);
  }

  await saveOccurrenceNote(
    supabase,
    occurrence.id,
    values.note,
    noteId,
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

export const action = async ({ context, request }: Route.ActionArgs) => {
  const supabase = context.get(supabaseContext);
  const user = context.get(userContext);

  if (!user) {
    return data(
      { error: 'Please log in to your account first', ok: false as const },
      { status: 401 }
    );
  }

  const submission = (await request.json()) as OccurrenceSubmission;

  switch (submission.intent) {
    case 'create':
      return runAction(
        addOccurrence(
          supabase,
          submission,
          user.id,
          getRequestTimeZone(request)
        ),
        'add_occurrence'
      );

    case 'delete':
      return runAction(
        deleteOccurrence(supabase, submission.occurrenceId),
        'remove_occurrence'
      );

    case 'remove-metric-value':
      return runAction(
        destroyMetricValue(
          supabase,
          submission.occurrenceId,
          submission.habitMetricId
        ),
        'remove_metric-value'
      );

    case 'remove-photo':
      try {
        await removeOccurrencePhotoPath(
          supabase,
          submission.occurrenceId,
          submission.photoPath
        );

        return { ok: true as const };
      } catch (error) {
        console.error(error);

        return { error: getErrorMessage(error), ok: false as const };
      }

    case 'update':
      return runAction(
        updateOccurrence(supabase, submission, user.id),
        'update_occurrence'
      );
  }
};

/**
 * Occurrence changes show up in the calendar, so the browser's calendar cache is cleared after
 * every submission, including failed ones that may have written part of the change.
 */
export const clientAction = async ({
  serverAction,
}: Route.ClientActionArgs) => {
  try {
    return await serverAction();
  } finally {
    clearCalendarData();
  }
};
