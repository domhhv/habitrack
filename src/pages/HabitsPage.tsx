import React from 'react';
import { data } from 'react-router';

import { HabitsTable } from '@components';
import type {
  HabitStats,
  HabitsSubmission,
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
  userContext,
  getErrorMessage,
  supabaseContext,
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

  if (request.headers.get('Content-Type')?.includes('application/json')) {
    const { trait } = (await request.json()) as HabitsSubmission;

    return runAction(
      createTrait(supabase, { ...trait, userId: user.id }),
      'add_trait'
    );
  }

  return runAction(
    addHabit(supabase, await request.formData(), user.id),
    'add_habit'
  );
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
