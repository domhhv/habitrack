import React from 'react';

export type Habit = {
  id: number;
  name: string;
  description: string;
  trait: 'good' | 'bad';
};

export const HabitsContext = React.createContext({
  fetchingHabits: false,
  habits: [] as Habit[],
  addHabit: (_: Habit) => {},
  removeHabit: (_: number) => {},
  updateHabit: (_: Habit) => {},
});

export const useHabits = () => {
  const context = React.useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  return context;
};
