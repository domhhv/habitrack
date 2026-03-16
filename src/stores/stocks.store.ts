import { useShallow } from 'zustand/react/shallow';

import type {
  Habit,
  MetricValue,
  HabitStockInsert,
  HabitStockUpdate,
  HabitStockWithDefaults,
  HabitStockMetricDefaultInsert,
} from '@models';
import {
  patchStock,
  createStock,
  destroyStock,
  listStocksByHabit,
  createStockMetricDefaults,
  destroyStockMetricDefaults,
} from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type StocksSlice = {
  stocks: Record<HabitStockWithDefaults['id'], HabitStockWithDefaults>;
  stockActions: {
    addStock: (
      stock: HabitStockInsert,
      metricDefaults?: HabitStockMetricDefaultInsert[]
    ) => Promise<HabitStockWithDefaults>;
    clearStocks: () => void;
    fetchStocksByHabit: (habitId: Habit['id']) => Promise<void>;
    removeStock: (id: HabitStockWithDefaults['id']) => Promise<void>;
    updateStock: (
      id: HabitStockWithDefaults['id'],
      stock: HabitStockUpdate
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

/* eslint-disable @typescript-eslint/no-dynamic-delete */
export const createStocksSlice: SliceCreator<keyof StocksSlice> = (set) => {
  return {
    stocks: {},

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

          const refreshed = await listStocksByHabit(newStock.habitId);
          const created = refreshed.find((s) => {
            return s.id === newStock.id;
          });

          if (created) {
            set(
              (state) => {
                state.stocks[created.id] = created;
              },
              undefined,
              'stockActions.addStock'
            );

            return created;
          }
        }

        set(
          (state) => {
            state.stocks[newStock.id] = newStock;
          },
          undefined,
          'stockActions.addStock'
        );

        return newStock;
      },

      clearStocks: () => {
        set(
          (state) => {
            state.stocks = {};
          },
          undefined,
          'stockActions.clearStocks'
        );
      },

      fetchStocksByHabit: async (habitId: Habit['id']) => {
        const stocks = await listStocksByHabit(habitId);

        set(
          (state) => {
            for (const stock of stocks) {
              state.stocks[stock.id] = stock;
            }
          },
          undefined,
          'stockActions.fetchStocksByHabit'
        );
      },

      removeStock: async (id: HabitStockWithDefaults['id']) => {
        await destroyStock(id);

        set(
          (state) => {
            delete state.stocks[id];
          },
          undefined,
          'stockActions.removeStock'
        );
      },

      updateStock: async (
        id: HabitStockWithDefaults['id'],
        stock: HabitStockUpdate
      ) => {
        const updated = await patchStock(id, stock);

        set(
          (state) => {
            state.stocks[id] = updated;
          },
          undefined,
          'stockActions.updateStock'
        );
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

        const refreshed = await listStocksByHabit(habitId);

        set(
          (state) => {
            for (const stock of refreshed) {
              state.stocks[stock.id] = stock;
            }
          },
          undefined,
          'stockActions.updateStockMetricDefaults'
        );
      },
    },
  };
};

export const useStocks = () => {
  return useBoundStore((state) => {
    return state.stocks;
  });
};

export const useHabitStocks = (habitId: Habit['id']) => {
  return useBoundStore(
    useShallow((state) => {
      return Object.values(state.stocks).filter((stock) => {
        return stock.habitId === habitId;
      });
    })
  );
};

export const useStockActions = () => {
  return useBoundStore((state) => {
    return state.stockActions;
  });
};
