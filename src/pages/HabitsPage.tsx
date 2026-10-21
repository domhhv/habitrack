import React from 'react';
import { data } from 'react-router';

import { HabitsTable } from '@components';
import type {
  HabitStats,
  HabitsSubmission,
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
  rollbar,
  runAction,
  userContext,
  getErrorMessage,
  buildHabitMetricInsert,
} from '@utils';

import type { Route } from './+types/HabitsPage';

const loadHabitsStats = async () => {
  const habitIds = await listHabitIds();

  if (habitIds.length === 0) {
    return {};
  }

  const stats = await getHabitsStats(habitIds);

  return Object.fromEntries(
    stats.flatMap((stat): [string, HabitStats][] => {
      return stat.habitId ? [[stat.habitId, stat]] : [];
    })
  );
};

const addHabit = async (formData: FormData, userId: string) => {
  const icon = formData.get('icon');
  const traitId = formData.get('traitId');
  const metricDefinitions = JSON.parse(
    String(formData.get('metricDefinitions') ?? '[]')
  ) as FormMetricDefinitions[];

  const habit = await createHabit({
    description: String(formData.get('description') ?? ''),
    name: String(formData.get('name') ?? ''),
    traitId: typeof traitId === 'string' && traitId ? traitId : null,
    userId,
    iconPath:
      icon && typeof icon !== 'string'
        ? await uploadHabitIcon(userId, icon)
        : '',
  });

  if (metricDefinitions.length > 0) {
    await createHabitMetrics(
      metricDefinitions.map((metric) => {
        return buildHabitMetricInsert(metric, habit.id, userId);
      })
    );
  }
};

export const clientLoader = async ({ context }: Route.ClientLoaderArgs) => {
  if (!context.get(userContext)) {
    return { habitsStats: {} };
  }

  try {
    return { habitsStats: await loadHabitsStats() };
  } catch (error) {
    rollbar.error(
      error instanceof Error ? error : new Error(getErrorMessage(error))
    );

    return { habitsStats: {} };
  }
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

  if (request.headers.get('Content-Type')?.includes('application/json')) {
    const { trait } = (await request.json()) as HabitsSubmission;

    return runAction(createTrait({ ...trait, userId: user.id }), 'add_trait');
  }

  return runAction(addHabit(await request.formData(), user.id), 'add_habit');
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
