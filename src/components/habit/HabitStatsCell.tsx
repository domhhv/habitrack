import { Skeleton } from '@heroui/react';
import React from 'react';

import type { Habit, HabitStats } from '@models';

export type HabitsStats = Record<Habit['id'], HabitStats>;

type HabitStatsValueProps = {
  habitId: Habit['id'];
  habitsStats: Promise<HabitsStats>;
  children: (stats: HabitStats) => React.ReactNode;
};

const HabitStatsValue = ({
  children,
  habitId,
  habitsStats,
}: HabitStatsValueProps) => {
  return children(React.use(habitsStats)[habitId] || {});
};

const HabitStatsCell = (props: HabitStatsValueProps) => {
  return (
    <React.Suspense
      fallback={<Skeleton aria-hidden="true" className="h-4 w-16 rounded-md" />}
    >
      <HabitStatsValue {...props} />
    </React.Suspense>
  );
};

export default HabitStatsCell;
