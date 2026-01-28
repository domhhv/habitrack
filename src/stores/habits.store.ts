import keyBy from 'lodash.keyby';

import type { Habit, HabitsInsert, HabitsUpdate } from '@models';
import { StorageBuckets } from '@models';
import {
  deleteFile,
  listHabits,
  patchHabit,
  createHabit,
  destroyHabit,
} from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type HabitsSlice = {
  habits: Record<Habit['id'], Habit>;
  habitActions: {
    addHabit: (habit: HabitsInsert) => Promise<void>;
    clearHabits: () => void;
    fetchHabits: () => Promise<void>;
    removeHabit: (habit: Habit) => Promise<void>;
    updateHabit: (id: Habit['id'], habit: HabitsUpdate) => Promise<void>;
  };
};

export const createHabitsSlice: SliceCreator<keyof HabitsSlice> = (set) => {
  return {
    habits: {},

    habitActions: {
      addHabit: async (habit: HabitsInsert) => {
        const newHabit = await createHabit(habit);

        set((state) => {
          state.habits[newHabit.id] = newHabit;
        });
      },

      clearHabits: () => {
        set((state) => {
          state.habits = {};
        });
      },

      fetchHabits: async () => {
        const habits = await listHabits();

        set((state) => {
          const prevHabitIds = state.calendarFilters.habitIds;
          const nextHabitIds = habits.map((habit) => {
            return habit.id;
          });

          state.habits = keyBy(habits, 'id');
          state.calendarFilters.habitIds =
            prevHabitIds.length === 0
              ? nextHabitIds
              : prevHabitIds.filter((id) => {
                  return nextHabitIds.includes(id);
                });
        });
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
};

export const useHabits = () => {
  return useBoundStore((state) => {
    return state.habits;
  });
};

export const useHabitActions = () => {
  return useBoundStore((state) => {
    return state.habitActions;
  });
};
