import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type {
  HabitStock,
  MetricValue,
  HabitStockUpdate,
  TypedSupabaseClient,
  HabitStockWithDefaults,
} from '@models';
import { parseMetricValueHolder } from '@utils';

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

export const patchStock = async (
  supabase: TypedSupabaseClient,
  id: HabitStock['id'],
  stock: HabitStockUpdate
): Promise<HabitStockWithDefaults> => {
  const { data, error } = await supabase
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

export const destroyStock = async (
  supabase: TypedSupabaseClient,
  id: HabitStock['id']
) => {
  const { error } = await supabase.from('habit_stocks').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export type StockFields = {
  cost: number | null;
  currency: string;
  name: string;
  remainingItems: number | null;
  totalItems: number | null;
};

export type StockMetricDefaultFields = {
  habitMetricId: string;
  shouldCompound: boolean;
  value: MetricValue;
};

export type SaveStockParams = {
  habitId: string;
  metricDefaults: StockMetricDefaultFields[] | null;
  stock: StockFields;
  stockId?: string;
};

export const saveStock = async (
  supabase: TypedSupabaseClient,
  { habitId, metricDefaults, stock, stockId }: SaveStockParams
) => {
  const { data, error } = await supabase.rpc('save_stock', {
    p_habit_id: habitId,
    p_stock: decamelizeKeys(stock),
    p_stock_id: stockId,
    p_metric_defaults:
      metricDefaults?.map((metricDefault) => {
        return decamelizeKeys(metricDefault);
      }) ?? undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
