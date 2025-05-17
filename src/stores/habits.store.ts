import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
  habits: Record<Habit['id'], Habit>;
  actions: {
    addHabit: (habit: HabitsInsert) => Promise<void>;
    clearHabits: () => void;
    fetchHabits: () => Promise<void>;
    removeHabit: (habit: Habit) => Promise<void>;
    updateHabit: (id: Habit['id'], habit: HabitsUpdate) => Promise<void>;
  };
};

const useHabitsStore = create<HabitsState>()(
  immer((set) => {
    return {
      habits: {},

      actions: {
        addHabit: async (habit: HabitsInsert) => {
          const newHabit = await createHabit(habit);
          set((state) => {
            state.habits[newHabit.id] = newHabit;
          });
        },

        clearHabits: () => {
          set({ habits: {} });
        },

        fetchHabits: async () => {
          const habits = await listHabits();

          const habitsMap = habits.reduce((acc, habit) => {
            return {
              ...acc,
              [habit.id]: habit,
            };
          }, {});

          set({ habits: habitsMap });
        },

        removeHabit: async ({ iconPath, id }: Habit) => {
          await destroyHabit(id);

          if (iconPath) {
            await deleteFile(StorageBuckets.HABIT_ICONS, iconPath);
          }

          set((state) => {
            delete state.habits[id];
          });
        },

        updateHabit: async (id: Habit['id'], habit: HabitsUpdate) => {
          const updatedHabit = await patchHabit(id, habit);

          set((state) => {
            state.habits[id] = updatedHabit;
          });
        },
      },
    };
  })
);

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
