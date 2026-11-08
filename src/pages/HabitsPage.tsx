import React from 'react';
import { data } from 'react-router';

import { HabitsTable } from '@components';
import type {
  HabitStats,
  FieldErrors,
  TypedSupabaseClient,
  FormMetricDefinitions,
} from '@models';
import {
  createHabit,
  createTrait,
  listHabitIds,
  getHabitsStats,
  uploadHabitIcon,
  createHabitMetrics,
} from '@services';
import {
  runAction,
  getFormJson,
  getFormText,
  userContext,
  getErrorMessage,
  supabaseContext,
  assertValidFields,
  getRequestTimeZone,
  getHabitFieldErrors,
  buildHabitMetricInsert,
} from '@utils';

import type { Route } from './+types/HabitsPage';

const loadHabitsStats = async (
  supabase: TypedSupabaseClient,
  timeZone: string
) => {
  const habitIds = await listHabitIds(supabase);

  if (habitIds.length === 0) {
    return {};
  }

  const stats = await getHabitsStats(supabase, habitIds, timeZone);

  return Object.fromEntries(
    stats.flatMap((stat): [string, HabitStats][] => {
      return stat.habitId ? [[stat.habitId, stat]] : [];
    })
  );
};

const TRAIT_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const addTrait = async (
  supabase: TypedSupabaseClient,
  formData: FormData,
  userId: string
) => {
  const fieldErrors: FieldErrors = {};
  const name = getFormText(formData, 'name');
  const color = `#${getFormText(formData, 'color').replace(/^#/, '')}`;

  if (!name) {
    fieldErrors.name = 'Give the trait a label';
  }

  if (!TRAIT_COLOR_PATTERN.test(color)) {
    fieldErrors.color = 'Enter a color as 6 hex digits, e.g. 94a3b8';
  }

  assertValidFields(fieldErrors);

  await createTrait(supabase, {
    color,
    description: getFormText(formData, 'description'),
    name,
    userId,
  });
};

const addHabit = async (
  supabase: TypedSupabaseClient,
  formData: FormData,
  userId: string
) => {
  assertValidFields(getHabitFieldErrors(formData));

  const icon = formData.get('icon');
  const traitId = getFormText(formData, 'traitId');
  const metricDefinitions = getFormJson<FormMetricDefinitions[]>(
    formData,
    'metricDefinitions',
    []
  );

  if (!Array.isArray(metricDefinitions)) {
    throw new Error('The metric definitions could not be read');
  }

  const habit = await createHabit(supabase, {
    description: getFormText(formData, 'description'),
    name: getFormText(formData, 'name'),
    traitId: traitId || null,
    userId,
    iconPath:
      icon instanceof File && icon.size > 0
        ? await uploadHabitIcon(supabase, userId, icon)
        : '',
  });

  if (metricDefinitions.length > 0) {
    await createHabitMetrics(
      supabase,
      metricDefinitions.map((metric) => {
        return buildHabitMetricInsert(metric, habit.id, userId);
      })
    );
  }
};

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  if (!context.get(userContext)) {
    return { habitsStats: {} };
  }

  try {
    return {
      habitsStats: await loadHabitsStats(
        context.get(supabaseContext),
        getRequestTimeZone(request)
      ),
    };
  } catch (error) {
    console.error('Failed to load habit stats', getErrorMessage(error));

    return { habitsStats: {} };
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

  const formData = await request.formData();

  switch (formData.get('intent')) {
    case 'create-habit':
      return runAction(addHabit(supabase, formData, user.id), 'add_habit');

    case 'create-trait':
      return runAction(addTrait(supabase, formData, user.id), 'add_trait');

    default:
      return data(
        { error: 'Unsupported habits request', ok: false as const },
        { status: 400 }
      );
  }
};

const HabitsPage = ({ loaderData: { habitsStats } }: Route.ComponentProps) => {
  return (
    <>
      <title>My Habits | Habitrack</title>
      <HabitsTable habitsStats={habitsStats} />
    </>
  );
};

export default HabitsPage;
