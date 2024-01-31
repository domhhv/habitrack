import { type Habit, HabitsContext, useUser } from '@context';
import { habitService } from '@services';
import React from 'react';

type HabitsProviderProps = {
  children: React.ReactNode;
};

const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const {
    user: { token },
  } = useUser();

  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    if (!token) {
      clearHabits();
      return undefined;
    }

    setFetchingHabits(true);

    habitService
      .getHabits(token)
      .then((res) => {
        setHabits(res);
        setFetchingHabits(false);
      })
      .finally(() => {
        setFetchingHabits(false);
      });
  }, [token]);

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
};

export default HabitsProvider;
