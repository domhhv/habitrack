import { habitActions } from '@actions';
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

type Props = {
  children: React.ReactNode;
};

export default function HabitsProvider({ children }: Props) {
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    const loadHabits = async () => {
      setFetchingHabits(true);
      const habits = await habitActions.getHabits();
      setHabits(habits);
      setFetchingHabits(false);
    };

    void loadHabits();
  }, []);

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

  const value = React.useMemo(
    () => ({ fetchingHabits, habits, addHabit, removeHabit, updateHabit }),
    [habits, fetchingHabits]
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}
