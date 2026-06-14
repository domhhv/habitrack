import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  HabitStock,
  HabitStockInsert,
  HabitStockUpdate,
  HabitStockWithDefaults,
  HabitStockMetricDefault,
  HabitStockMetricDefaultInsert,
} from '@models';
import { supabaseClient } from '@utils';

const STOCK_WITH_DEFAULTS_SELECT = `
  *,
  metric_defaults:habit_stock_metric_defaults(id, habit_metric_id, value, should_compound, created_at, updated_at),
  usages:occurrence_stock_usages(count)
`;

export const createStock = async (
  body: HabitStockInsert
): Promise<HabitStockWithDefaults> => {
  const { data, error } = await supabaseClient
    .from('habit_stocks')
    .insert(decamelizeKeys(body))
    .select(STOCK_WITH_DEFAULTS_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { usages, ...stock } = camelcaseKeys(data, { deep: true });

  return {
    ...stock,
    usageCount: usages?.[0]?.count ?? 0,
  };
};

export const patchStock = async (
  id: HabitStock['id'],
  stock: HabitStockUpdate
): Promise<HabitStockWithDefaults> => {
  const { data, error } = await supabaseClient
    .from('habit_stocks')
    .update(decamelizeKeys(stock))
    .eq('id', id)
    .select(STOCK_WITH_DEFAULTS_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { usages, ...updatedStock } = camelcaseKeys(data, { deep: true });

  return {
    ...updatedStock,
    usageCount: usages?.[0]?.count ?? 0,
  };
};

export const destroyStock = async (id: HabitStock['id']) => {
  const { error } = await supabaseClient
    .from('habit_stocks')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const createStockMetricDefaults = async (
  body: HabitStockMetricDefaultInsert[]
): Promise<HabitStockMetricDefault[]> => {
  const { data, error } = await supabaseClient
    .from('habit_stock_metric_defaults')
    .insert(
      body.map((b) => {
        return decamelizeKeys(b);
      })
    )
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data, { deep: true });
};

export const destroyStockMetricDefaults = async (
  habitStockId: HabitStock['id']
) => {
  const { error } = await supabaseClient
    .from('habit_stock_metric_defaults')
    .delete()
    .eq('habit_stock_id', habitStockId);

  if (error) {
    throw new Error(error.message);
  }
};
