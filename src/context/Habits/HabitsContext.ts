import type { AddHabit, Habit, HabitsMap, UpdateHabit } from '@models';
import React from 'react';

type HabitsContextType = {
  addingHabit: boolean;
  fetchingHabits: boolean;
  habits: Habit[];
  habitsMap: HabitsMap;
  addHabit: (habit: AddHabit) => Promise<Habit>;
  removeHabit: (habitId: number) => Promise<void>;
  updateHabit: (habitId: number, habit: UpdateHabit) => Promise<Habit>;
};

export const HabitsContext = React.createContext<HabitsContextType>({
  addingHabit: false,
  fetchingHabits: false,
  habits: [] as Habit[],
  habitsMap: {} as HabitsMap,
  addHabit: (_: AddHabit) => Promise.resolve({} as Habit),
  removeHabit: (_: number) => Promise.resolve(),
  updateHabit: (_: number, __: UpdateHabit) => Promise.resolve({} as Habit),
});

export const useHabits = () => {
  const context = React.useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  return context;
};
