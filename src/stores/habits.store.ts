import type { Habit, HabitsInsert, HabitsUpdate } from '@models';
import {
  createHabit,
  deleteFile,
  destroyHabit,
  listHabits,
  patchHabit,
  StorageBuckets,
  uploadHabitIcon,
} from '@services';
import { create } from 'zustand';

import { useOccurrencesStore } from './index';

type HabitsState = {
  habits: Habit[];
  actions: {
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
};

export const useHabitsStore = create<HabitsState>((set) => {
  return {
    habits: [],

    actions: {
      clearHabits: () => {
        set({ habits: [] });
      },

      fetchHabits: async () => {
        const habits = await listHabits();
        set({ habits });
      },

      addHabit: async (habit: HabitsInsert, icon?: File | null) => {
        const iconPath = await uploadHabitIcon(habit.userId, icon);
        const newHabit = await createHabit({ ...habit, iconPath });
        set((state) => {
          return { habits: [...state.habits, newHabit] };
        });
      },

      updateHabit: async (
        id: number,
        userId: string,
        habit: HabitsUpdate,
        icon?: File | null
      ) => {
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
      },

      removeHabit: async ({ id, iconPath }: Habit) => {
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
      },
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

export const useHabits = () => {
  return useHabitsStore((state) => {
    return state.habits;
  });
};

export const useHabitActions = () => {
  return useHabitsStore((state) => {
    return state.actions;
  });
};
