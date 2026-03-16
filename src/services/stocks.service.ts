import decamelizeKeys from 'decamelize-keys';

import type {
  HabitStock,
  HabitStockInsert,
  HabitStockUpdate,
  HabitStockWithDefaults,
  HabitStockMetricDefault,
  HabitStockMetricDefaultInsert,
} from '@models';
import { supabaseClient, deepCamelcaseKeys, deepCamelcaseArray } from '@utils';

const STOCK_WITH_DEFAULTS_SELECT = `
  *,
  metric_defaults:habit_stock_metric_defaults(id, habit_metric_id, value, should_compound, created_at, updated_at),
  usages:occurrence_stock_usages(count)
`;

const transformStock = (data: unknown): HabitStockWithDefaults => {
  const { usages, ...stock } = deepCamelcaseKeys<
    Omit<HabitStockWithDefaults, 'usageCount'> & {
      usages: { count: number }[];
    }
  >(data);

  return {
    ...stock,
    usageCount: usages?.[0]?.count ?? 0,
  };
};

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

  return transformStock(data);
};

export const listStocksByHabit = async (
  habitId: HabitStock['habitId']
): Promise<HabitStockWithDefaults[]> => {
  const { data, error } = await supabaseClient
    .from('habit_stocks')
    .select(STOCK_WITH_DEFAULTS_SELECT)
    .eq('habit_id', habitId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown[]).map(transformStock);
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

  return transformStock(data);
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

  return deepCamelcaseArray<HabitStockMetricDefault>(data);
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
