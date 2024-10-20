import { HabitsContext, useSnackbar } from '@context';
import { useDataFetch } from '@hooks';
import type { Habit, HabitsMap } from '@models';
import {
  createHabit,
  deleteFile,
  destroyHabit,
  type HabitsInsert,
  type HabitsUpdate,
  listHabits,
  patchHabit,
  StorageBuckets,
} from '@services';
import { makeTestHabit } from '@tests';
import React, { type ReactNode } from 'react';

const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { showSnackbar } = useSnackbar();

  const [addingHabit, setAddingHabit] = React.useState(false);
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([makeTestHabit()]);
  const [habitsMap, setHabitsMap] = React.useState<HabitsMap>({});

  const fetchHabits = React.useCallback(async () => {
    setFetchingHabits(true);

    const habits = await listHabits();
    setHabits(habits);

    const habitsMap = habits.reduce((acc, habit) => {
      return { ...acc, [habit.id]: habit };
    }, {});

    setHabitsMap(habitsMap);

    setFetchingHabits(false);
  }, []);

  const clearHabits = React.useCallback(() => {
    setHabits([]);
    setHabitsMap({});
  }, []);

  useDataFetch({
    clear: clearHabits,
    load: fetchHabits,
  });

  React.useEffect(() => {
    setHabitsMap(
      habits.reduce((acc, habit) => {
        return { ...acc, [habit.id]: habit };
      }, {})
    );
  }, [habits]);

  const addHabit = async (habit: HabitsInsert) => {
    try {
      setAddingHabit(true);

      const newHabit = await createHabit(habit);

      setHabits((prevHabits) => [...prevHabits, newHabit]);
      setHabitsMap((prevHabits) => ({
        ...prevHabits,
        [newHabit.id]: newHabit,
      }));
      showSnackbar('Your habit has been added!', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });

      return newHabit as Habit;
    } catch (error) {
      showSnackbar('Something went wrong while adding your habit', {
        color: 'danger',
        dismissible: true,
      });

      console.error(error);

      return Promise.resolve({} as Habit);
    } finally {
      setAddingHabit(false);
    }
  };

  const updateHabit = async (id: number, habit: HabitsUpdate) => {
    try {
      const updatedHabit = await patchHabit(id, habit);

      setHabits((prevHabits) => {
        const habitIndex = prevHabits.findIndex((h) => h.id === id);
        const nextHabits = [...prevHabits];
        nextHabits[habitIndex] = updatedHabit;
        return nextHabits;
      });
      setHabitsMap((prevHabits) => ({ ...prevHabits, [id]: updatedHabit }));

      showSnackbar('Your habit has been updated!', {
        color: 'success',
        dismissible: true,
      });

      return updatedHabit;
    } catch (error) {
      showSnackbar('Something went wrong while updating your habit', {
        color: 'danger',
        dismissible: true,
      });

      console.error(error);

      return Promise.resolve({} as Habit);
    }
  };

  const removeHabit = async (id: number) => {
    try {
      await destroyHabit(id);

      if (habitsMap[id]?.iconPath) {
        await deleteFile(StorageBuckets.HABIT_ICONS, habitsMap[id].iconPath!);
      }

      const nextHabits = habits.filter((habit) => habit.id !== id);
      setHabits(nextHabits);

      const nextHabitsMap = { ...habitsMap };
      delete nextHabitsMap[id];
      setHabitsMap(nextHabitsMap);

      showSnackbar('Your habit has been deleted!', {
        dismissible: true,
      });
    } catch (error) {
      showSnackbar('Something went wrong while deleting your habit', {
        color: 'danger',
        dismissible: true,
      });

      console.error(error);
    }
  };

  const value = React.useMemo(
    () => ({
      addingHabit,
      fetchingHabits,
      habits,
      habitsMap,
      addHabit,
      removeHabit,
      updateHabit,
    }),
    [addingHabit, fetchingHabits, habits, habitsMap] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
};

export default React.memo(HabitsProvider);
