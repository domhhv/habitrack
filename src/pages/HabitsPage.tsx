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
  getFormText,
  userContext,
  getErrorMessage,
  supabaseContext,
  assertValidFields,
  getRequestTimeZone,
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
  const icon = formData.get('icon');
  const traitId = formData.get('traitId');
  const metricDefinitions = JSON.parse(
    String(formData.get('metricDefinitions') ?? '[]')
  ) as FormMetricDefinitions[];

  const habit = await createHabit(supabase, {
    description: String(formData.get('description') ?? ''),
    name: String(formData.get('name') ?? ''),
    traitId: typeof traitId === 'string' && traitId ? traitId : null,
    userId,
    iconPath:
      icon && typeof icon !== 'string'
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

  if (formData.get('intent') === 'create-trait') {
    return runAction(addTrait(supabase, formData, user.id), 'add_trait');
  }

  return runAction(addHabit(supabase, formData, user.id), 'add_habit');
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
