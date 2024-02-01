import { type Habit, HabitsContext, useUser } from '@context';
import { habitService } from '@services';
import React from 'react';

type HabitsProviderProps = {
  children: React.ReactNode;
};

const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const { user } = useUser();

  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    if (!user.token) {
      clearHabits();
      return undefined;
    }

    setFetchingHabits(true);

    habitService
      .getHabits(user)
      .then((res) => {
        setHabits(res);
        setFetchingHabits(false);
      })
      .finally(() => {
        setFetchingHabits(false);
      });
  }, [user]);

  const addHabit = (habit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, habit]);
  };

  const removeHabit = (id: number) => {
    setHabits((prevHabits) =>
      prevHabits.filter((prevHabit) => prevHabit.id !== id)
    );
  };

  const updateHabit = (habit: Habit) => {
    console.log('ctx updateHabit', habit);
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
};

export default HabitsProvider;
