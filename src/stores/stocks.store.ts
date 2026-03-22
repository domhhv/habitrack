import type {
  Habit,
  MetricValue,
  HabitStockInsert,
  HabitStockUpdate,
  HabitStockWithDefaults,
  HabitStockMetricDefaultInsert,
} from '@models';
import {
  getHabit,
  patchStock,
  createStock,
  destroyStock,
  createStockMetricDefaults,
  destroyStockMetricDefaults,
} from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type StocksSlice = {
  stockActions: {
    addStock: (
      stock: HabitStockInsert,
      metricDefaults?: HabitStockMetricDefaultInsert[]
    ) => Promise<HabitStockWithDefaults>;
    refreshHabitStocks: (habitId: Habit['id']) => Promise<void>;
    removeStock: (
      id: HabitStockWithDefaults['id'],
      habitId: Habit['id']
    ) => Promise<void>;
    updateStock: (
      id: HabitStockWithDefaults['id'],
      stock: HabitStockUpdate,
      habitId: Habit['id']
    ) => Promise<void>;
    updateStockMetricDefaults: (
      habitId: Habit['id'],
      stockId: HabitStockWithDefaults['id'],
      metricDefaults: Record<string, MetricValue | undefined>,
      compoundDefaults: Record<string, boolean>,
      userId: string
    ) => Promise<void>;
  };
};

const refreshHabitInStore = async (
  habitId: Habit['id'],
  set: Parameters<SliceCreator<keyof StocksSlice>>[0]
) => {
  const habit = await getHabit(habitId);

  set(
    (state) => {
      state.habits[habitId] = habit;
    },
    undefined,
    'stockActions.refreshHabitStocks'
  );
};

export const createStocksSlice: SliceCreator<keyof StocksSlice> = (set) => {
  return {
    stockActions: {
      addStock: async (
        stock: HabitStockInsert,
        metricDefaults?: HabitStockMetricDefaultInsert[]
      ) => {
        const newStock = await createStock(stock);

        if (metricDefaults && metricDefaults.length > 0) {
          const defaults = metricDefaults.map((md) => {
            return {
              ...md,
              habitStockId: newStock.id,
            };
          });

          await createStockMetricDefaults(defaults);
        }

        await refreshHabitInStore(newStock.habitId, set);

        // Return the latest version from the refreshed habit
        const state = useBoundStore.getState();
        const refreshedStock = state.habits[newStock.habitId]?.stocks.find(
          (s) => {
            return s.id === newStock.id;
          }
        );

        return refreshedStock ?? newStock;
      },

      refreshHabitStocks: async (habitId: Habit['id']) => {
        await refreshHabitInStore(habitId, set);
      },

      removeStock: async (
        id: HabitStockWithDefaults['id'],
        habitId: Habit['id']
      ) => {
        await destroyStock(id);
        await refreshHabitInStore(habitId, set);
      },

      updateStock: async (
        id: HabitStockWithDefaults['id'],
        stock: HabitStockUpdate,
        habitId: Habit['id']
      ) => {
        await patchStock(id, stock);
        await refreshHabitInStore(habitId, set);
      },

      updateStockMetricDefaults: async (
        habitId: Habit['id'],
        stockId: HabitStockWithDefaults['id'],
        metricDefaults: Record<string, MetricValue | undefined>,
        compoundDefaults: Record<string, boolean>,
        userId: string
      ) => {
        await destroyStockMetricDefaults(stockId);

        const inserts: HabitStockMetricDefaultInsert[] = Object.entries(
          metricDefaults
        )
          .filter(([, val]) => {
            return val !== undefined;
          })
          .map(([metricId, val]) => {
            return {
              habitMetricId: metricId,
              habitStockId: stockId,
              shouldCompound: compoundDefaults[metricId] ?? false,
              userId,
              value: val as MetricValue,
            };
          });

        if (inserts.length > 0) {
          await createStockMetricDefaults(inserts);
        }

        await refreshHabitInStore(habitId, set);
      },
    },
  };
};

export const useStockActions = () => {
  return useBoundStore((state) => {
    return state.stockActions;
  });
};
