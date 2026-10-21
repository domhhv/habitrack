import { Alert } from '@heroui/react';
import React from 'react';
import { data, isRouteErrorResponse } from 'react-router';

import { CustomButton, HabitDetails } from '@components';
import {
  type Habit,
  StorageBuckets,
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
  habitId: Habit['id'],
  icon: File,
  userId: string
) => {
  const iconPath = await uploadHabitIcon(userId, icon);
  const habit = await getHabit(habitId);

  if (habit?.iconPath) {
    await deleteFile(StorageBuckets.HABIT_ICONS, habit.iconPath);
  }

  await patchHabit(habitId, { iconPath });
};

const deleteHabit = async (habitId: Habit['id'], userId: string) => {
  const habit = await getHabit(habitId);
  const photosPath = `${userId}/${habitId}/`;
  const photos = await listFiles(StorageBuckets.OCCURRENCE_PHOTOS, photosPath);

  await Promise.all(
    photos.map((photo) => {
      return deleteFile(
        StorageBuckets.OCCURRENCE_PHOTOS,
        `${photosPath}${photo.name}`
      );
    })
  );

  await destroyHabit(habitId);

  if (habit?.iconPath) {
    await deleteFile(StorageBuckets.HABIT_ICONS, habit.iconPath);
  }
};

const saveMetrics = async (
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
    await destroyHabitMetrics(idsToRemove);
  }

  if (metricsToAdd.length > 0) {
    await createHabitMetrics(
      metricsToAdd.map((metric) => {
        return buildHabitMetricInsert(metric, habitId, userId);
      })
    );
  }

  await Promise.all(
    metricsToUpdate.map(({ config, id, isRequired, name, sortOrder, type }) => {
      return patchHabitMetric(id, {
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
  habitId: Habit['id'],
  submission: Extract<HabitDetailsSubmission, { intent: 'add-stock' }>,
  userId: string
) => {
  const stock = await createStock({ ...submission.stock, habitId, userId });
  const metricDefaultInserts = buildStockMetricDefaultInserts(
    stock.id,
    submission.metricDefaults,
    userId
  );

  if (metricDefaultInserts.length > 0) {
    await createStockMetricDefaults(metricDefaultInserts);
  }
};

const updateStock = async (
  {
    metricDefaults,
    stock,
    stockId,
  }: Extract<HabitDetailsSubmission, { intent: 'update-stock' }>,
  userId: string
) => {
  await patchStock(stockId, stock);

  if (!metricDefaults) {
    return;
  }

  await destroyStockMetricDefaults(stockId);

  const metricDefaultInserts = buildStockMetricDefaultInserts(
    stockId,
    metricDefaults,
    userId
  );

  if (metricDefaultInserts.length > 0) {
    await createStockMetricDefaults(metricDefaultInserts);
  }
};

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  const habit = await getHabit(params.habitId);

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
      replaceHabitIcon(habitId, icon, user.id).finally(clearCalendarData),
      'upload_icon'
    );
  }

  const submission = (await request.json()) as HabitDetailsSubmission;

  switch (submission.intent) {
    case 'add-stock':
      return runAction(addStock(habitId, submission, user.id), 'add_stock');

    case 'delete-habit':
      return runAction(
        deleteHabit(habitId, user.id).finally(clearCalendarData),
        'remove_habit'
      );

    case 'remove-stock':
      return runAction(destroyStock(submission.stockId), 'remove_stock');

    case 'save-metrics':
      return runAction(
        saveMetrics(habitId, submission.metricDefinitions, user.id).finally(
          clearCalendarData
        ),
        'update_habit'
      );

    case 'update-habit':
      return runAction(
        patchHabit(habitId, submission.habit).finally(clearCalendarData),
        'update_habit'
      );

    case 'update-stock':
      return runAction(updateStock(submission, user.id), 'update_stock');
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
