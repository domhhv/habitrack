import type { Habit, HabitsInsert, HabitsUpdate } from '@models';
import React from 'react';

type HabitsContextType = {
  habitIdBeingUpdated: number | null;
  habitIdBeingDeleted: number | null;
  addingHabit: boolean;
  fetchingHabits: boolean;
  habits: Habit[];
  addHabit: (habit: HabitsInsert, icon?: File | null) => Promise<void>;
  removeHabit: (habit: Habit) => Promise<void>;
  updateHabit: (
    habitId: number,
    userId: string,
    habit: HabitsUpdate,
    icon?: File | null
  ) => Promise<void>;
};

export const HabitsContext = React.createContext<HabitsContextType | null>(
  null
);

export const useHabits = () => {
  const context = React.useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  return context;
};
