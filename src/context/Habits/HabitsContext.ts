import type { AddHabit, Habit, HabitsMap } from '@models';
import { type PostEntity } from '@services';
import React from 'react';

export const HabitsContext = React.createContext({
  addingHabit: false,
  fetchingHabits: false,
  habits: [] as Habit[],
  habitsMap: {} as HabitsMap,
  addHabit: (_: AddHabit) => Promise.resolve({} as Habit),
  removeHabit: (_: number) => Promise.resolve(),
  updateHabit: (_: number, __: PostEntity<Habit>) =>
    Promise.resolve({} as Habit),
});

export const useHabits = () => {
  const context = React.useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  return context;
};
