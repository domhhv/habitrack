import {
  type Habit,
  HabitsContext,
  type HabitsMap,
  useSnackbar,
} from '@context';
import {
  listHabits,
  createHabit,
  destroyHabit,
  patchHabit,
  type PostEntity,
} from '@services';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import React from 'react';

type HabitsProviderProps = {
  children: React.ReactNode;
};

const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { showSnackbar } = useSnackbar();

  const [addingHabit, setAddingHabit] = React.useState(false);
  const [fetchingHabits, setFetchingHabits] = React.useState(false);
  const [habits, setHabits] = React.useState<HabitsMap>({});

  const fetchHabits = async () => {
    setFetchingHabits(true);

    const habits = await listHabits();

    const habitsMap = habits.reduce((acc, habit) => {
      return { ...acc, [habit.id]: habit };
    }, {});
    setHabits(habitsMap);
    setFetchingHabits(false);
  };

  React.useEffect(() => {
    void fetchHabits();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearHabits();
      }

      if (event === 'SIGNED_IN') {
        void fetchHabits();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [user, supabase]);

  const clearHabits = () => {
    setHabits({});
  };

  const addHabit = async (habit: PostEntity<Habit>) => {
    try {
      setAddingHabit(true);

      const newHabit = await createHabit(habit);

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

  const updateHabit = async (
    id: number,
    habit: PostEntity<Habit>
  ): Promise<Habit> => {
    try {
      const updatedHabit = await patchHabit(id, habit);

      setHabits((prevHabits) => ({ ...prevHabits, [id]: updatedHabit }));

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

      const nextHabits = { ...habits };
      delete nextHabits[id];
      setHabits(nextHabits);

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
