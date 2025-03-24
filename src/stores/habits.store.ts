import { addToast } from '@heroui/react';
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
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

import { useOccurrencesStore } from './index';

type HabitsState = {
  habits: Habit[];
  addingHabit: boolean;
  fetchingHabits: boolean;
  habitIdBeingUpdated: number | null;
  habitIdBeingDeleted: number | null;
  clearHabits: () => void;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: HabitsInsert, icon?: File | null) => Promise<void>;
  updateHabit: (
    id: number,
    userId: string,
    habit: HabitsUpdate,
    icon?: File | null
  ) => Promise<void>;
  removeHabit: (habit: Habit) => Promise<void>;
};

const useHabitsStore = create<HabitsState>((set) => {
  return {
    habits: [],
    addingHabit: false,
    fetchingHabits: true,
    habitIdBeingUpdated: null,
    habitIdBeingDeleted: null,

    clearHabits: () => {
      set({ habits: [] });
    },

    fetchHabits: async () => {
      set({ fetchingHabits: true });

      try {
        const habits = await listHabits();
        set({ habits });
      } catch (error) {
        console.error(error);

        addToast({
          title:
            'Something went wrong while fetching your habits. Please try reloading the page.',
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
        });
      } finally {
        set({ fetchingHabits: false });
      }
    },

    addHabit: async (habit: HabitsInsert, icon?: File | null) => {
      set({ addingHabit: true });

      try {
        const iconPath = await uploadHabitIcon(habit.userId, icon);
        const newHabit = await createHabit({ ...habit, iconPath });
        set((state) => {
          return { habits: [...state.habits, newHabit] };
        });

        addToast({
          title: 'Your habit has been added!',
          color: 'success',
        });
      } catch (error) {
        console.error(error);

        addToast({
          title:
            'Something went wrong while adding your habit. Please try again.',
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
        });
      } finally {
        set({ addingHabit: false });
      }
    },

    updateHabit: async (
      id: number,
      userId: string,
      habit: HabitsUpdate,
      icon?: File | null
    ) => {
      set({ habitIdBeingUpdated: id });

      try {
        let iconPath = habit.iconPath;

        if (icon) {
          iconPath = await uploadHabitIcon(userId, icon);
        }

        const updatedHabit = await patchHabit(id, { ...habit, iconPath });
        set((state) => {
          return {
            habits: state.habits.map((h) => {
              return h.id === id ? updatedHabit : h;
            }),
          };
        });

        addToast({
          title: 'Your habit has been updated!',
          color: 'success',
        });
      } catch (error) {
        console.error(error);

        addToast({
          title:
            'Something went wrong while updating your habit. Please try again.',
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
        });
      } finally {
        set({ habitIdBeingUpdated: null });
      }
    },

    removeHabit: async ({ id, iconPath }: Habit) => {
      set({ habitIdBeingDeleted: id });

      const { removeOccurrencesByHabitIdFromState } =
        useOccurrencesStore.getState();

      try {
        await destroyHabit(id);

        if (iconPath) {
          await deleteFile(StorageBuckets.HABIT_ICONS, iconPath);
        }

        set((state) => {
          return {
            habits: state.habits.filter((habit) => {
              return habit.id !== id;
            }),
          };
        });

        removeOccurrencesByHabitIdFromState(id);

        addToast({
          title: 'Your habit has been deleted.',
          color: 'success',
        });
      } catch (error) {
        console.error(error);

        addToast({
          title:
            'Something went wrong while deleting your habit. Please try again.',
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
        });
      } finally {
        set({ habitIdBeingDeleted: null });
      }
    },
  };
});

useHabitsStore.subscribe((state, prevState) => {
  const { updateFilteredBy } = useOccurrencesStore.getState();

  if (prevState.habits.length !== state.habits.length) {
    updateFilteredBy({
      habitIds: new Set(
        state.habits.map((habit) => {
          return habit.id.toString();
        })
      ),
    });
  }
});

const uploadHabitIcon = async (userId: string, icon?: File | null) => {
  let iconPath = '';

  if (icon) {
    iconPath = `${userId}/${Date.now()}-${icon.name}`;
    await uploadFile(StorageBuckets.HABIT_ICONS, iconPath, icon);
  }

  return iconPath;
};

export default useHabitsStore;
