import type { Habit, HabitsInsert, HabitsUpdate } from '@models';
import { StorageBuckets } from '@models';
import {
  createHabit,
  deleteFile,
  destroyHabit,
  listHabits,
  patchHabit,
} from '@services';
import { create } from 'zustand';

type HabitsState = {
  habits: Habit[];
  actions: {
    clearHabits: () => void;
    fetchHabits: () => Promise<void>;
    addHabit: (habit: HabitsInsert) => Promise<void>;
    updateHabit: (id: number, habit: HabitsUpdate) => Promise<void>;
    removeHabit: (habit: Habit) => Promise<void>;
  };
};

const useHabitsStore = create<HabitsState>((set) => {
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

      addHabit: async (habit: HabitsInsert) => {
        const newHabit = await createHabit(habit);
        set((state) => {
          return { habits: [...state.habits, newHabit] };
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
