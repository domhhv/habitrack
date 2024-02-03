import React from 'react';

export type Habit = {
  id: number;
  name: string;
  description: string;
  trait: 'good' | 'bad';
};

type HabitId = number;
export type HabitsMap = Record<HabitId, Habit>;

type HabitsContextType = {
  addingHabit: boolean;
  fetchingHabits: boolean;
  habits: HabitsMap;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  removeHabit: (habitId: number) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
};

export const HabitsContext = React.createContext<HabitsContextType>({
  addingHabit: false,
  fetchingHabits: false,
  habits: [] as Habit[],
  addHabit: (_: Omit<Habit, 'id'>) => Promise.resolve(),
  removeHabit: (_: number) => Promise.resolve(),
  updateHabit: (_: Habit) => Promise.resolve(),
});

export const useHabits = () => {
  const context = React.useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  return context;
};
