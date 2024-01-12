import { habitActions } from '@actions';
import React from 'react';

import { useUser } from './User';

export type Habit = {
  id: number;
  name: string;
  description: string;
  trait: 'good' | 'bad';
};

const HabitsContext = React.createContext({
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

type Props = {
  children: React.ReactNode;
};

export default function HabitsProvider({ children }: Props) {
  const { accessToken } = useUser();
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    const loadHabits = async () => {
      if (!accessToken) {
        clearHabits();
        return null;
      }

      setFetchingHabits(true);
      const habits = await habitActions.getHabits(accessToken as string);
      setHabits(habits);
      setFetchingHabits(false);
    };

    void loadHabits();
  }, [accessToken]);

  const addHabit = (habit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, habit]);
  };

  const removeHabit = (id: number) => {
    setHabits((prevHabits) =>
      prevHabits.filter((prevHabit) => prevHabit.id !== id)
    );
  };

  const updateHabit = (habit: Habit) => {
    setHabits((prevHabits) =>
      prevHabits.map((prevHabit) =>
        prevHabit.id === habit.id ? { ...prevHabit, ...habit } : prevHabit
      )
    );
  };

  const clearHabits = () => {
    setHabits([]);
  };

  const value = React.useMemo(
    () => ({ fetchingHabits, habits, addHabit, removeHabit, updateHabit }),
    [habits, fetchingHabits]
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}
