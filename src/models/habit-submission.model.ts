import type { HabitsUpdate } from './habit.model';
import type { MetricValue, FormMetricDefinitions } from './metric.model';
import type { HabitStockInsert, HabitStockUpdate } from './stock.model';
import type { TraitsInsert } from './trait.model';

export type StockMetricDefaultsSubmission = {
  compound: Record<string, boolean>;
  values: Record<string, MetricValue>;
};

export type HabitsSubmission = {
  intent: 'create-trait';
  trait: Pick<TraitsInsert, 'name' | 'color' | 'description'>;
};

export type HabitDetailsSubmission =
  | {
      intent: 'add-stock';
      metricDefaults: StockMetricDefaultsSubmission;
      stock: Omit<HabitStockInsert, 'userId' | 'habitId'>;
    }
  | { intent: 'delete-habit' }
  | { intent: 'remove-stock'; stockId: string }
  | { intent: 'save-metrics'; metricDefinitions: FormMetricDefinitions[] }
  | {
      intent: 'update-habit';
      habit: Pick<
        HabitsUpdate,
        'name' | 'traitId' | 'motivation' | 'description'
      >;
    }
  | {
      intent: 'update-stock';
      metricDefaults?: StockMetricDefaultsSubmission;
      stock: HabitStockUpdate;
      stockId: string;
    };
