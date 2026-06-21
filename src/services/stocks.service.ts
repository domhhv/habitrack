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
import { supabaseClient, parseMetricValueHolder } from '@utils';

const STOCK_WITH_DEFAULTS_SELECT = `
  *,
  metric_defaults:habit_stock_metric_defaults(id, habit_metric_id, value, should_compound, created_at, updated_at),
  usages:occurrence_stock_usages(count)
`;

type RawStock = Omit<
  HabitStockWithDefaults,
  'metricDefaults' | 'usageCount'
> & {
  usages: { count: number }[];
  metricDefaults: (Omit<
    HabitStockWithDefaults['metricDefaults'][number],
    'value'
  > & {
    value: unknown;
  })[];
};

/**
 * DB-read boundary for stocks. Camelcased rows carry each default's `value` as `Json`; the
 * structural metric-value predicate validates and narrows it cast-free (throwing on malformed data;
 * defended at write time by the `validate_metric_value` trigger).
 */
const toStockWithDefaults = ({
  metricDefaults,
  usages,
  ...stock
}: RawStock): HabitStockWithDefaults => {
  return {
    ...stock,
    metricDefaults: metricDefaults.map(parseMetricValueHolder),
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

  return toStockWithDefaults(camelcaseKeys(data, { deep: true }));
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

  return toStockWithDefaults(camelcaseKeys(data, { deep: true }));
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

  return camelcaseKeys(data, { deep: true }).map((metricDefault) => {
    return parseMetricValueHolder(metricDefault);
  });
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
