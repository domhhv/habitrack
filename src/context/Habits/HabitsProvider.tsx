import {
  type Habit,
  HabitsContext,
  type HabitsMap,
  useSnackbar,
  useUser,
} from '@context';
import { habitService } from '@services';
import React from 'react';

type HabitsProviderProps = {
  children: React.ReactNode;
};

const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();

  const [addingHabit, setAddingHabit] = React.useState(false);
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<HabitsMap>({});

  React.useEffect(() => {
    if (!user.accessToken) {
      clearHabits();
      return undefined;
    }

    setFetchingHabits(true);

    habitService
      .getHabits(user)
      .then((res) => {
        const habits = res.reduce((acc, habit) => {
          return { ...acc, [habit.id]: habit };
        }, {});
        setHabits(habits);
        setFetchingHabits(false);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setFetchingHabits(false);
      });
  }, [user]);

  const addHabit = async (habit: Omit<Habit, 'id'>) => {
    try {
      setAddingHabit(true);
      const newHabit = await habitService.createHabit(habit, user);
      setHabits((prevHabits) => ({ ...prevHabits, [newHabit.id]: newHabit }));
      showSnackbar('Your habit has been added!', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      showSnackbar('Something went wrong while adding your habit', {
        color: 'danger',
        dismissible: true,
      });

      console.error(error);
    } finally {
      setAddingHabit(false);
    }
  };

  const removeHabit = async (id: number) => {
    try {
      await habitService.destroyHabit(id, user);

      const nextHabits = { ...habits };
      delete nextHabits[id];
      setHabits(nextHabits);

      showSnackbar('Your habit has been deleted!', {
        dismissible: true,
      });
    } catch (error) {
      showSnackbar('Something went wrong while removing your habit', {
        color: 'danger',
        dismissible: true,
      });

      console.error(error);
    }
  };

  const updateHabit = async (habit: Habit) => {
    try {
      await habitService.updateHabit(habit, user);

      setHabits((prevHabits) => ({ ...prevHabits, [habit.id]: habit }));

      showSnackbar('Your habit has been updated!', {
        color: 'success',
        dismissible: true,
      });
    } catch (error) {
      showSnackbar('Something went wrong while updating your habit', {
        color: 'danger',
        dismissible: true,
      });

      console.error(error);
    }
  };

  const clearHabits = () => {
    setHabits([]);
  };

  const value = React.useMemo(
    () => ({
      addingHabit,
      fetchingHabits,
      habits,
      addHabit,
      removeHabit,
      updateHabit,
    }),
    [addingHabit, fetchingHabits, habits] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
};

export default HabitsProvider;
