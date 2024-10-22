import { HabitsContext, useSnackbar } from '@context';
import { useDataFetch } from '@hooks';
import type { Habit, HabitsInsert, HabitsUpdate } from '@models';
import {
  createHabit,
  deleteFile,
  destroyHabit,
  listHabits,
  patchHabit,
  StorageBuckets,
  uploadFile,
} from '@services';
import { makeTestHabit } from '@tests';
import { getErrorMessage } from '@utils';
import React, { type ReactNode } from 'react';

const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { showSnackbar } = useSnackbar();
  const [addingHabit, setAddingHabit] = React.useState(false);
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<Habit[]>([makeTestHabit()]);
  const [habitIdBeingUpdated, setHabitIdBeingUpdated] = React.useState<
    number | null
  >(null);
  const [habitIdBeingDeleted, setHabitIdBeingDeleted] = React.useState<
    number | null
  >(null);

  const fetchHabits = React.useCallback(async () => {
    try {
      setFetchingHabits(true);
      setHabits(await listHabits());
    } catch (error) {
      console.error(error);
      showSnackbar(
        'Something went wrong while fetching your habits. Please try reloading the page.',
        {
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
          dismissible: true,
        }
      );
    } finally {
      setFetchingHabits(false);
    }
  }, [showSnackbar]);

  const clearHabits = React.useCallback(() => {
    setHabits([]);
  }, []);

  useDataFetch({
    clear: clearHabits,
    load: fetchHabits,
  });

  const uploadHabitIcon = async (userId: string, icon?: File | null) => {
    let iconPath = '';

    if (icon) {
      iconPath = `${userId}/${Date.now()}-${icon.name}`;
      await uploadFile(StorageBuckets.HABIT_ICONS, iconPath, icon);
    }

    return iconPath;
  };

  const addHabit = React.useCallback(
    async (habit: HabitsInsert, icon?: File | null) => {
      try {
        setAddingHabit(true);

        const iconPath = await uploadHabitIcon(habit.userId, icon);

        const newHabit = await createHabit({ ...habit, iconPath });

        setHabits((prevHabits) => [...prevHabits, newHabit]);

        showSnackbar('Your habit has been added!', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while adding your habit. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );

        console.error(error);
      } finally {
        setAddingHabit(false);
      }
    },
    [showSnackbar]
  );

  const updateHabit = React.useCallback(
    async (
      id: number,
      userId: string,
      habit: HabitsUpdate,
      icon?: File | null
    ) => {
      try {
        setHabitIdBeingUpdated(id);

        const iconPath = await uploadHabitIcon(userId, icon);

        const updatedHabit = await patchHabit(id, { ...habit, iconPath });

        setHabits((prevHabits) => {
          const habitIndex = prevHabits.findIndex((h) => h.id === id);
          const nextHabits = [...prevHabits];
          nextHabits[habitIndex] = updatedHabit;
          return nextHabits;
        });

        showSnackbar('Your habit has been updated!', {
          color: 'success',
          dismissible: true,
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while updating your habit. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );

        console.error(error);
      } finally {
        setHabitIdBeingUpdated(null);
      }
    },
    [showSnackbar]
  );

  const removeHabit = React.useCallback(
    async ({ id, iconPath }: Habit) => {
      try {
        setHabitIdBeingDeleted(id);

        await destroyHabit(id);

        if (iconPath) {
          await deleteFile(StorageBuckets.HABIT_ICONS, iconPath);
        }

        setHabits((prevHabits) => {
          return prevHabits.filter((habit) => habit.id !== id);
        });

        showSnackbar('Your habit has been deleted.', {
          dismissible: true,
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while deleting your habit. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );

        console.error(error);
      } finally {
        setHabitIdBeingDeleted(null);
      }
    },
    [showSnackbar]
  );

  const value = React.useMemo(() => {
    return {
      habitIdBeingUpdated,
      habitIdBeingDeleted,
      addingHabit,
      fetchingHabits,
      habits,
      addHabit,
      removeHabit,
      updateHabit,
    };
  }, [
    habitIdBeingUpdated,
    habitIdBeingDeleted,
    addingHabit,
    fetchingHabits,
    habits,
    addHabit,
    removeHabit,
    updateHabit,
  ]);

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
};

export default React.memo(HabitsProvider);
