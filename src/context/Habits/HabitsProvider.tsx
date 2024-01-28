import { type Habit, HabitsContext, useUser } from '@context';
import { habitService } from '@services';
import React from 'react';

type HabitsProviderProps = {
  children: React.ReactNode;
};

const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const { accessToken } = useUser();
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    if (!accessToken) {
      clearHabits();
      return undefined;
    }

    setFetchingHabits(true);

    habitService
      .getHabits(accessToken as string)
      .then((res) => {
        setHabits(res);
        setFetchingHabits(false);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setFetchingHabits(false);
      });
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
};

export default HabitsProvider;
