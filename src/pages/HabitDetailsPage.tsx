import { Alert } from '@heroui/react';
import React from 'react';
import { data, href, isRouteErrorResponse } from 'react-router';

import { CustomButton, HabitDetails } from '@components';
import {
  type Habit,
  StorageBuckets,
  type FieldErrors,
  type HabitsUpdate,
  type HabitDetailsIntent,
  type TypedSupabaseClient,
  type FormMetricDefinitions,
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
  getFormJson,
  getFormText,
  userContext,
  getErrorMessage,
  supabaseContext,
  assertValidFields,
  getHabitFieldErrors,
  buildHabitMetricInsert,
} from '@utils';

import type { Route } from './+types/HabitDetailsPage';

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

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
  formData: FormData,
  userId: string
) => {
  const metricDefinitions = getFormJson<FormMetricDefinitions[]>(
    formData,
    'metricDefinitions',
    []
  );

  if (!Array.isArray(metricDefinitions)) {
    throw new Error('The metric definitions could not be read');
  }

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

const updateHabit = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id'],
  formData: FormData
) => {
  assertValidFields(getHabitFieldErrors(formData));

  const habitUpdate: HabitsUpdate = {};

  if (formData.has('name')) {
    habitUpdate.name = getFormText(formData, 'name');
  }

  for (const field of ['description', 'motivation', 'traitId'] as const) {
    if (formData.has(field)) {
      habitUpdate[field] = getFormText(formData, field) || null;
    }
  }

  await patchHabit(supabase, habitId, habitUpdate);
};

const getFormCount = (formData: FormData, name: string) => {
  const value = getFormText(formData, name);

  return value ? Number(value) : null;
};

const isWholeNumber = (value: number, min: number) => {
  return Number.isInteger(value) && value >= min;
};

const getStockFields = (formData: FormData) => {
  const fieldErrors: FieldErrors = {};
  const name = getFormText(formData, 'name');
  const currency = getFormText(formData, 'currency').toUpperCase();
  const cost = getFormCount(formData, 'cost');
  const isQuantifiable = formData.has('isQuantifiable');
  const totalItems = isQuantifiable
    ? getFormCount(formData, 'totalItems')
    : null;
  const remainingItems = getFormCount(formData, 'remainingItems');

  if (!name) {
    fieldErrors.name = 'Give the stock a name';
  }

  if (cost !== null && !(Number.isFinite(cost) && cost >= 0)) {
    fieldErrors.cost = 'Enter a cost of 0 or more';
  }

  if (!CURRENCY_CODE_PATTERN.test(currency)) {
    fieldErrors.currency = 'Use a 3-letter code, e.g. EUR';
  }

  if (
    isQuantifiable &&
    !(totalItems !== null && isWholeNumber(totalItems, 1))
  ) {
    fieldErrors.totalItems = 'Enter a whole number of at least 1';
  }

  if (remainingItems !== null && !isWholeNumber(remainingItems, 0)) {
    fieldErrors.remainingItems = 'Enter a whole number of 0 or more';
  }

  assertValidFields(fieldErrors);

  return {
    cost,
    currency,
    name,
    totalItems,
    remainingItems:
      totalItems === null
        ? null
        : Math.min(remainingItems ?? totalItems, totalItems),
  };
};

const getStockMetricDefaults = (formData: FormData) => {
  const metricDefaults = getFormJson<StockMetricDefaultsSubmission | null>(
    formData,
    'metricDefaults',
    null
  );

  if (
    metricDefaults !== null &&
    (typeof metricDefaults?.compound !== 'object' ||
      typeof metricDefaults?.values !== 'object')
  ) {
    throw new Error('The metric defaults could not be read');
  }

  return metricDefaults;
};

const addStock = async (
  supabase: TypedSupabaseClient,
  habitId: Habit['id'],
  formData: FormData,
  userId: string
) => {
  const stockFields = getStockFields(formData);
  const metricDefaults = getStockMetricDefaults(formData);
  const stock = await createStock(supabase, {
    ...stockFields,
    habitId,
    isDepleted: false,
    userId,
  });

  if (!metricDefaults) {
    return;
  }

  const metricDefaultInserts = buildStockMetricDefaultInserts(
    stock.id,
    metricDefaults,
    userId
  );

  if (metricDefaultInserts.length > 0) {
    await createStockMetricDefaults(supabase, metricDefaultInserts);
  }
};

const updateStock = async (
  supabase: TypedSupabaseClient,
  stockId: string,
  formData: FormData,
  userId: string
) => {
  const stockFields = getStockFields(formData);
  const metricDefaults = getStockMetricDefaults(formData);

  await patchStock(supabase, stockId, stockFields);

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

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const habit = await getHabit(context.get(supabaseContext), params.habitId);

  if (!habit) {
    throw data('Habit not found', { status: 404 });
  }

  return { habit };
};

export const action = async ({
  context,
  params: { habitId },
  request,
}: Route.ActionArgs) => {
  const supabase = context.get(supabaseContext);
  const user = context.get(userContext);

  if (!user) {
    return data(
      { error: 'Please log in to your account first', ok: false as const },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const stockId = getFormText(formData, 'stockId');
  const missingStock = data(
    { error: 'Choose a stock first', ok: false as const },
    { status: 400 }
  );

  switch (formData.get('intent') as HabitDetailsIntent) {
    case 'add-stock':
      return runAction(
        addStock(supabase, habitId, formData, user.id),
        'add_stock'
      );

    case 'delete-habit':
      return runAction(deleteHabit(supabase, habitId, user.id), 'remove_habit');

    case 'remove-stock':
      return stockId
        ? runAction(destroyStock(supabase, stockId), 'remove_stock')
        : missingStock;

    case 'save-metrics':
      return runAction(
        saveMetrics(supabase, habitId, formData, user.id),
        'update_habit'
      );

    case 'set-stock-depleted':
      return stockId
        ? runAction(
            patchStock(supabase, stockId, {
              isDepleted: formData.get('isDepleted') === 'true',
            }),
            'update_stock'
          )
        : missingStock;

    case 'update-habit':
      return runAction(
        updateHabit(supabase, habitId, formData),
        'update_habit'
      );

    case 'update-stock':
      return stockId
        ? runAction(
            updateStock(supabase, stockId, formData, user.id),
            'update_stock'
          )
        : missingStock;

    case 'upload-icon': {
      const icon = formData.get('icon');

      return icon instanceof File && icon.size > 0
        ? runAction(
            replaceHabitIcon(supabase, habitId, icon, user.id),
            'upload_icon'
          )
        : data(
            { error: 'Please choose an icon to upload', ok: false as const },
            { status: 400 }
          );
    }

    default:
      return data(
        { error: 'Unsupported habit request', ok: false as const },
        { status: 400 }
      );
  }
};

/**
 * Habit changes show up in calendar chips, so the browser's calendar cache is cleared after every
 * submission, including failed ones that may have written part of the change.
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
        <CustomButton variant="danger-soft" href={href('/habits')}>
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
