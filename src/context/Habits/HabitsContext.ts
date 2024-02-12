import { type PostEntity } from '@services';
import React from 'react';

export type Habit = {
  id: number;
  name: string;
  description: string;
  trait: 'good' | 'bad';
  user_id: string;
  created_at: string;
  updated_at: string;
  icon_path: string;
};

type HabitId = string;
export type HabitsMap = Record<HabitId, Habit>;

export type AddHabit = PostEntity<Omit<Habit, 'icon_path'>>;

type HabitsContextType = {
  addingHabit: boolean;
  fetchingHabits: boolean;
  habits: Habit[];
  habitsMap: HabitsMap;
  addHabit: (habit: AddHabit) => Promise<Habit>;
  removeHabit: (habitId: number) => Promise<void>;
  updateHabit: (id: number, habit: PostEntity<Habit>) => Promise<Habit>;
};

export const HabitsContext = React.createContext<HabitsContextType>({
  addingHabit: false,
  fetchingHabits: false,
  habits: [],
  habitsMap: {},
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
