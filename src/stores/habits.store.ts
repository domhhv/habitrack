import { create } from 'zustand';

import type { Habit, HabitsInsert, HabitsUpdate } from '@models';
import { StorageBuckets } from '@models';
import {
  deleteFile,
  listHabits,
  patchHabit,
  createHabit,
  destroyHabit,
} from '@services';

type HabitsState = {
  habits: Habit[];
  actions: {
    addHabit: (habit: HabitsInsert) => Promise<void>;
    clearHabits: () => void;
    fetchHabits: () => Promise<void>;
    removeHabit: (habit: Habit) => Promise<void>;
    updateHabit: (id: number, habit: HabitsUpdate) => Promise<void>;
  };
};

const useHabitsStore = create<HabitsState>((set) => {
  return {
    habits: [],

    actions: {
      addHabit: async (habit: HabitsInsert) => {
        const newHabit = await createHabit(habit);
        set((state) => {
          return { habits: [...state.habits, newHabit] };
        });
      },

      clearHabits: () => {
        set({ habits: [] });
      },

      fetchHabits: async () => {
        const habits = await listHabits();
        set({ habits });
      },

      removeHabit: async ({ iconPath, id }: Habit) => {
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

      updateHabit: async (id: number, habit: HabitsUpdate) => {
        const updatedHabit = await patchHabit(id, habit);

        set((state) => {
          return {
            habits: state.habits.map((h) => {
              return h.id === id ? updatedHabit : h;
            }),
          };
        });
      },
    },
  };
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
