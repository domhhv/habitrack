import { Alert } from '@heroui/react';
import React from 'react';
import { data, isRouteErrorResponse } from 'react-router';

import { CustomButton, HabitDetails } from '@components';
import {
  type Habit,
  StorageBuckets,
  type TypedSupabaseClient,
  type HabitDetailsSubmission,
  type StockMetricDefaultsSubmission,
} from '@models';
import {
  getHabit,
  listFiles,
  deleteFile,
  patchHabit,
  patchStock,
  createStock,
  destroyHabit,
  destroyStock,
  uploadHabitIcon,
  patchHabitMetric,
  clearCalendarData,
  createHabitMetrics,
  destroyHabitMetrics,
  createStockMetricDefaults,
  destroyStockMetricDefaults,
} from '@services';
import {
  runAction,
  userContext,
  getErrorMessage,
  supabaseContext,
  buildHabitMetricInsert,
} from '@utils';

import type { Route } from './+types/HabitDetailsPage';

const buildStockMetricDefaultInserts = (
  habitStockId: string,
  { compound, values }: StockMetricDefaultsSubmission,
  userId: string
) => {
  return Object.entries(values).map(([habitMetricId, value]) => {
    return {
      habitMetricId,
      habitStockId,
      shouldCompound: compound[habitMetricId] ?? false,
      userId,
      value,
    };
  });
};

const replaceHabitIcon = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id'],
  icon: File,
  userId: string
) => {
  const iconPath = await uploadHabitIcon(supabase, userId, icon);
  const habit = await getHabit(supabase, habitId);

  if (habit?.iconPath) {
    await deleteFile(supabase, StorageBuckets.HABIT_ICONS, habit.iconPath);
  }

  await patchHabit(supabase, habitId, { iconPath });
};

const deleteHabit = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id'],
  userId: string
) => {
  const habit = await getHabit(supabase, habitId);
  const photosPath = `${userId}/${habitId}/`;
  const photos = await listFiles(
    supabase,
    StorageBuckets.OCCURRENCE_PHOTOS,
    photosPath
  );

  await Promise.all(
    photos.map((photo) => {
      return deleteFile(
        supabase,
        StorageBuckets.OCCURRENCE_PHOTOS,
        `${photosPath}${photo.name}`
      );
    })
  );

  await destroyHabit(supabase, habitId);

  if (habit?.iconPath) {
    await deleteFile(supabase, StorageBuckets.HABIT_ICONS, habit.iconPath);
  }
};

const saveMetrics = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id'],
  metricDefinitions: Extract<
    HabitDetailsSubmission,
    { intent: 'save-metrics' }
  >['metricDefinitions'],
  userId: string
) => {
  const idsToRemove = metricDefinitions
    .filter((metric) => {
      return metric.isToBeRemoved;
    })
    .map((metric) => {
      return metric.id;
    });
  const metricsToAdd = metricDefinitions.filter((metric) => {
    return metric.isToBeAdded && !metric.isToBeRemoved;
  });
  const metricsToUpdate = metricDefinitions.filter((metric) => {
    return metric.isToBeUpdated && !metric.isToBeRemoved;
  });

  if (idsToRemove.length > 0) {
    await destroyHabitMetrics(supabase, idsToRemove);
  }

  if (metricsToAdd.length > 0) {
    await createHabitMetrics(
      supabase,
      metricsToAdd.map((metric) => {
        return buildHabitMetricInsert(metric, habitId, userId);
      })
    );
  }

  await Promise.all(
    metricsToUpdate.map(({ config, id, isRequired, name, sortOrder, type }) => {
      return patchHabitMetric(supabase, id, {
        config,
        isRequired,
        name,
        sortOrder,
        type,
      });
    })
  );
};

const addStock = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id'],
  submission: Extract<HabitDetailsSubmission, { intent: 'add-stock' }>,
  userId: string
) => {
  const stock = await createStock(supabase, {
    ...submission.stock,
    habitId,
    userId,
  });
  const metricDefaultInserts = buildStockMetricDefaultInserts(
    stock.id,
    submission.metricDefaults,
    userId
  );

  if (metricDefaultInserts.length > 0) {
    await createStockMetricDefaults(supabase, metricDefaultInserts);
  }
};

const updateStock = async (
  supabase: TypedSupabaseClient,
  {
    metricDefaults,
    stock,
    stockId,
  }: Extract<HabitDetailsSubmission, { intent: 'update-stock' }>,
  userId: string
) => {
  await patchStock(supabase, stockId, stock);

  if (!metricDefaults) {
    return;
  }

  await destroyStockMetricDefaults(supabase, stockId);

  const metricDefaultInserts = buildStockMetricDefaultInserts(
    stockId,
    metricDefaults,
    userId
  );

  if (metricDefaultInserts.length > 0) {
    await createStockMetricDefaults(supabase, metricDefaultInserts);
  }
};

export const clientLoader = async ({
  context,
  params,
}: Route.ClientLoaderArgs) => {
  const habit = await getHabit(context.get(supabaseContext), params.habitId);

  if (!habit) {
    throw data('Habit not found', { status: 404 });
  }

  return { habit };
};

export const clientAction = async ({
  context,
  params: { habitId },
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
    const icon = (await request.formData()).get('icon');

    if (!icon || typeof icon === 'string') {
      return data(
        { error: 'Please choose an icon to upload', ok: false as const },
        { status: 400 }
      );
    }

    return runAction(
      replaceHabitIcon(supabase, habitId, icon, user.id).finally(
        clearCalendarData
      ),
      'upload_icon'
    );
  }

  const submission = (await request.json()) as HabitDetailsSubmission;

  switch (submission.intent) {
    case 'add-stock':
      return runAction(
        addStock(supabase, habitId, submission, user.id),
        'add_stock'
      );

    case 'delete-habit':
      return runAction(
        deleteHabit(supabase, habitId, user.id).finally(clearCalendarData),
        'remove_habit'
      );

    case 'remove-stock':
      return runAction(
        destroyStock(supabase, submission.stockId),
        'remove_stock'
      );

    case 'save-metrics':
      return runAction(
        saveMetrics(
          supabase,
          habitId,
          submission.metricDefinitions,
          user.id
        ).finally(clearCalendarData),
        'update_habit'
      );

    case 'update-habit':
      return runAction(
        patchHabit(supabase, habitId, submission.habit).finally(
          clearCalendarData
        ),
        'update_habit'
      );

    case 'update-stock':
      return runAction(
        updateStock(supabase, submission, user.id),
        'update_stock'
      );
  }
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="mx-auto flex h-full w-3xl max-w-11/12 flex-1 items-center justify-center">
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="font-bold">
            {isNotFound ? 'Habit not found' : "Couldn't load this habit"}
          </Alert.Title>
          {!isNotFound && (
            <Alert.Description>{getErrorMessage(error)}</Alert.Description>
          )}
        </Alert.Content>
        <CustomButton href="/habits" variant="danger-soft">
          My habits
        </CustomButton>
      </Alert>
    </div>
  );
};

const HabitDetailsPage = ({ loaderData: { habit } }: Route.ComponentProps) => {
  return (
    <div className="mx-auto w-7xl max-w-full px-8 pb-2 lg:px-16">
      <title>{habit.name}</title>
      <HabitDetails habit={habit} key={habit.id} />
    </div>
  );
};

export default HabitDetailsPage;
