import { data } from 'react-router';

import type {
  TypedSupabaseClient,
  OccurrenceSubmission,
  OccurrenceSaveSubmission,
  OccurrenceValuesSubmission,
} from '@models';
import {
  getHabit,
  getOccurrence,
  saveOccurrence,
  clearCalendarData,
  destroyOccurrence,
  destroyMetricValue,
  removeOccurrencePhotoPath,
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

const saveOccurrenceSubmission = async (
  supabase: TypedSupabaseClient,
  submission: OccurrenceSaveSubmission,
  userId: string,
  timeZone: string
) => {
  const { photoPaths, values } = submission;
  const ownPhotoPaths = assertOwnPhotoPaths(photoPaths, userId);
  const { cost, currency } = await getCost(supabase, values);

  await saveOccurrence(supabase, {
    depletedStockIds: values.depletedStockIds,
    metricValues: values.metricValues,
    note: values.note,
    photoPaths: ownPhotoPaths,
    stockUsages: values.stockUsages,
    ...(submission.intent === 'update'
      ? { occurrenceId: submission.occurrenceId }
      : {}),
    occurrence: {
      cost,
      currency,
      habitId: values.selectedHabitId,
      hasSpecificTime: values.hasSpecificTime,
      occurredAt: values.occurredAt,
      ...(submission.intent === 'create' ? { timeZone } : {}),
    },
  });
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
        saveOccurrenceSubmission(
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
        saveOccurrenceSubmission(
          supabase,
          submission,
          user.id,
          getRequestTimeZone(request)
        ),
        'update_occurrence'
      );
  }
};

/**
 * Occurrence changes show up in the calendar, so the browser's calendar cache is cleared after
 * every submission.
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
