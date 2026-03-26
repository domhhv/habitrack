# Stocks

Habit stocks represent purchased batches or packs of items related to a habit (e.g., a can of nicotine pouches, a bag of coffee beans). They track inventory, cost, and can auto-populate metric values when logging occurrences. This document covers **habit stocks**, **stock metric defaults**, and **occurrence stock usages**.

## Database

### `habit_stocks` table

Schema: [`supabase/schemas/11_habit_stocks.sql`](../supabase/schemas/11_habit_stocks.sql)

| Column            | Type          | Notes                                             |
| ----------------- | ------------- | ------------------------------------------------- |
| `id`              | UUID          | PK                                                |
| `user_id`         | UUID          | FK `auth.users`                                   |
| `habit_id`        | UUID          | FK `habits` (CASCADE DELETE)                      |
| `name`            | TEXT          | Non-empty check                                   |
| `cost`            | NUMERIC(10,2) | Nullable (no cost tracking if null)               |
| `currency`        | TEXT          | Default `'EUR'`                                   |
| `total_items`     | INTEGER       | Nullable, check > 0. **Null = semi-quantifiable** |
| `remaining_items` | INTEGER       | Nullable, check >= 0                              |
| `is_depleted`     | BOOLEAN       | Default `false`                                   |
| `purchased_at`    | TIMESTAMPTZ   | Default `now()`                                   |

**Constraints**:

- `remaining_le_total`: `remaining_items IS NULL OR total_items IS NULL OR remaining_items <= total_items`

Indexes: `idx_habit_stocks_user_id`, `idx_habit_stocks_habit_id`

### `habit_stock_metric_defaults` table

Schema: [`supabase/schemas/12_habit_stock_metric_defaults.sql`](../supabase/schemas/12_habit_stock_metric_defaults.sql)

Stores predefined metric values per stock. When a stock is selected during occurrence logging, these defaults auto-populate the metric value inputs.

| Column            | Type    | Notes                                                                 |
| ----------------- | ------- | --------------------------------------------------------------------- |
| `id`              | UUID    | PK                                                                    |
| `user_id`         | UUID    | FK `auth.users`                                                       |
| `habit_stock_id`  | UUID    | FK `habit_stocks` (CASCADE DELETE)                                    |
| `habit_metric_id` | UUID    | FK `habit_metrics` (CASCADE DELETE)                                   |
| `value`           | JSONB   | The default metric value (same shape as occurrence metric values)     |
| `should_compound` | BOOLEAN | Default `false`. When true, numeric values sum across selected stocks |

**Unique constraint**: `(habit_stock_id, habit_metric_id)` - one default per metric per stock.

### `occurrence_stock_usages` table

Schema: [`supabase/schemas/13_occurrence_stock_usages.sql`](../supabase/schemas/13_occurrence_stock_usages.sql)

Junction table linking occurrences to stocks with quantity consumed.

| Column           | Type    | Notes                              |
| ---------------- | ------- | ---------------------------------- |
| `id`             | UUID    | PK                                 |
| `user_id`        | UUID    | FK `auth.users`                    |
| `occurrence_id`  | UUID    | FK `occurrences` (CASCADE DELETE)  |
| `habit_stock_id` | UUID    | FK `habit_stocks` (CASCADE DELETE) |
| `quantity`       | INTEGER | Default `1`, check > 0             |

**Unique constraint**: `(occurrence_id, habit_stock_id)` - one usage record per stock per occurrence.

**RLS insert policy** additionally verifies that both the occurrence and the stock belong to the authenticated user.

### Auto-Depletion Triggers

Defined in [`supabase/schemas/02_functions.sql`](../supabase/schemas/02_functions.sql), attached to `occurrence_stock_usages`:

| Trigger                 | Function                         | Behavior                                                                                                                                                            |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on_stock_usage_insert` | `update_stock_on_usage_insert()` | Decrements `remaining_items` by quantity. Sets `is_depleted = true` when `remaining_items <= 0`. Only runs for quantifiable stocks (`remaining_items IS NOT NULL`). |
| `on_stock_usage_delete` | `update_stock_on_usage_delete()` | Restores `remaining_items` by deleted quantity. Recalculates `is_depleted`.                                                                                         |
| `on_stock_usage_update` | `update_stock_on_usage_update()` | Restores old quantity to old stock, applies new quantity to new stock. Handles stock changes in a single update.                                                    |

All trigger functions are `SECURITY DEFINER` so they can update stocks regardless of RLS.

### Relationships

- Deleting a **habit** cascades to `habit_stocks` → `habit_stock_metric_defaults` + `occurrence_stock_usages`.
- Deleting a **stock** cascades to its metric defaults and all usage records (trigger restores nothing since stock is gone).
- Deleting an **occurrence** cascades to its stock usage records (trigger restores `remaining_items`).

## Quantifiable vs. Semi-Quantifiable

The distinction is determined by whether `total_items` is set:

| Aspect              | Quantifiable (`total_items IS NOT NULL`)                   | Semi-Quantifiable (`total_items IS NULL`)            |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| Example             | 20 pouches in a can, 100 tea bags                          | Coffee beans, protein powder                         |
| Inventory tracking  | Exact count via `remaining_items / total_items`            | No count tracking                                    |
| Auto-depletion      | Automatic via DB triggers when `remaining_items` reaches 0 | Manual only (user marks as depleted)                 |
| Occurrence form     | Quantity selector (min 1, max `remaining_items`)           | Checkbox only, plus option to mark as depleted       |
| Cost per occurrence | Calculable at log time: `(cost / totalItems) * quantity`   | Only calculable after depletion: `cost / usageCount` |

## Types & Models

### Stock types

File: [`src/models/stock.model.ts`](../src/models/stock.model.ts)

| Type                            | Purpose                                                                |
| ------------------------------- | ---------------------------------------------------------------------- |
| `HabitStock`                    | CamelCased row from `habit_stocks`                                     |
| `HabitStockInsert`              | Insert type                                                            |
| `HabitStockUpdate`              | Update type                                                            |
| `HabitStockMetricDefault`       | CamelCased row from `habit_stock_metric_defaults`                      |
| `HabitStockMetricDefaultInsert` | Insert type                                                            |
| `HabitStockWithDefaults`        | `HabitStock` extended with `metricDefaults[]` and `usageCount: number` |
| `StockFormValues`               | Client-side form state for stock creation/editing                      |

### Stock usage types

File: [`src/models/occurrence-stock-usage.model.ts`](../src/models/occurrence-stock-usage.model.ts)

| Type                         | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| `OccurrenceStockUsage`       | CamelCased row from `occurrence_stock_usages` |
| `OccurrenceStockUsageInsert` | Insert type                                   |
| `OccurrenceStockUsageUpdate` | Update type                                   |

### Integration with Habit and Occurrence models

In [`src/models/habit.model.ts`](../src/models/habit.model.ts):

```typescript
type Habit = BaseHabit & {
  stocks: HabitStockWithDefaults[];
  // ...
};
```

In [`src/models/occurrence.model.ts`](../src/models/occurrence.model.ts):

```typescript
type RawOccurrence = BaseOccurrence & {
  stockUsages: Omit<OccurrenceStockUsage, 'userId' | 'occurrenceId'>[];
  // ...
};
```

## Service Layer

### Stocks service

File: [`src/services/stocks.service.ts`](../src/services/stocks.service.ts)

| Function                     | Signature                                                                       | Notes                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `createStock`                | `(body: HabitStockInsert) => Promise<HabitStockWithDefaults>`                   | Uses custom SELECT to include metric defaults and usage count |
| `listStocksByHabit`          | `(habitId) => Promise<HabitStockWithDefaults[]>`                                | Ordered by `created_at DESC`                                  |
| `patchStock`                 | `(id, stock: HabitStockUpdate) => Promise<HabitStockWithDefaults>`              | Update any stock fields                                       |
| `destroyStock`               | `(id) => Promise<void>`                                                         | Cascade deletes usages and defaults                           |
| `createStockMetricDefaults`  | `(body: HabitStockMetricDefaultInsert[]) => Promise<HabitStockMetricDefault[]>` | Batch insert defaults                                         |
| `destroyStockMetricDefaults` | `(habitStockId) => Promise<void>`                                               | Clear all defaults for a stock                                |

**Eager loading SELECT** used by stock queries:

```sql
*, metric_defaults:habit_stock_metric_defaults(...), usages:occurrence_stock_usages(count)
```

The `usages(count)` aggregation gives `usageCount` without fetching all usage rows.

### Stock usages service

File: [`src/services/occurrence-stock-usages.service.ts`](../src/services/occurrence-stock-usages.service.ts)

| Function                      | Signature                                                                   | Notes                                     |
| ----------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| `createOccurrenceStockUsages` | `(usages: OccurrenceStockUsageInsert[]) => Promise<OccurrenceStockUsage[]>` | Batch insert; triggers auto-decrement     |
| `updateOccurrenceStockUsage`  | `(id, usage: OccurrenceStockUsageUpdate) => Promise<OccurrenceStockUsage>`  | Update quantity; trigger adjusts stock    |
| `deleteOccurrenceStockUsages` | `(ids: string[]) => Promise<void>`                                          | Batch delete; triggers restore quantities |

### Eager loading in related services

- [`src/services/habits.service.ts`](../src/services/habits.service.ts): `getHabit()` includes `stocks:habit_stocks(*, metric_defaults:..., usages:...)`
- [`src/services/occurrences.service.ts`](../src/services/occurrences.service.ts): Occurrence queries include `stock_usages:occurrence_stock_usages(id, habit_stock_id, quantity, ...)`

## State Management

File: [`src/stores/stocks.store.ts`](../src/stores/stocks.store.ts)

Hook: `useStockActions()` returns all actions.

| Action                                                                                  | What it does                                                                                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `addStock(stock, metricDefaults?)`                                                      | Creates stock, then creates metric defaults (with the new stock ID), then refreshes the parent habit in store |
| `removeStock(id, habitId)`                                                              | Deletes stock, refreshes habit                                                                                |
| `updateStock(id, stock, habitId)`                                                       | Patches stock fields, refreshes habit                                                                         |
| `updateStockMetricDefaults(habitId, stockId, metricDefaults, compoundDefaults, userId)` | Destroys all existing defaults, creates new ones, refreshes habit                                             |
| `refreshHabitStocks(habitId)`                                                           | Re-fetches the entire habit (including stocks) via `getHabit()` and replaces it in `habits` store             |

All stock mutations use a `refreshHabitInStore()` helper that re-fetches the entire habit via `getHabit()`, ensuring the store always has fresh data with correct usage counts.

## UI Components

All in [`src/components/stock/`](../src/components/stock/):

### HabitStockManager

File: [`HabitStockManager.tsx`](../src/components/stock/HabitStockManager.tsx)

Container component displayed in the habit details view. Separates active and depleted stocks, provides an "Add stock" button.

### AddStockForm

File: [`AddStockForm.tsx`](../src/components/stock/AddStockForm.tsx)

Creation form with fields: name, cost, currency, quantifiable toggle, total items (if quantifiable), and metric defaults configuration.

When quantifiable is toggled on, `totalItems` is required (min 1) and `remainingItems` is set to equal `totalItems`.

### StockListItem

File: [`StockListItem.tsx`](../src/components/stock/StockListItem.tsx)

Displays and edits a single stock. Shows:

- Name with depleted badge
- Cost formatted via `Intl.NumberFormat`
- Remaining/total count for quantifiable stocks
- Cost per item: `stock.cost / stock.totalItems`
- Avg cost per occurrence (when depleted): `stock.cost / stock.usageCount`

Actions: toggle `isDepleted`, edit mode, delete with confirmation.

### StockMetricDefaults

File: [`StockMetricDefaults.tsx`](../src/components/stock/StockMetricDefaults.tsx)

Renders `MetricValuesSection` (from the metrics components) for configuring default metric values per stock. Shows a compound toggle for number-type metrics that have a configured default.

## Occurrence Form Integration

File: [`src/components/occurrence/OccurrenceFormView.tsx`](../src/components/occurrence/OccurrenceFormView.tsx)

### Stock selection UI

When logging an occurrence, active (non-depleted) stocks for the selected habit are shown as checkboxes:

- **Quantifiable stocks**: Checkbox + quantity NumberInput (min 1, max `remaining_items`)
- **Semi-quantifiable stocks**: Checkbox + option to mark as depleted

State: `stockSelections: Record<stockId, quantity | null>` and `depletedStockIds: Set<string>`

### Metric auto-population from stock defaults

When stocks are selected/deselected, a `useEffect` in `OccurrenceFormView` auto-populates metric values:

1. Build a map of which metrics are provided by which selected stocks
2. **Orphaned metrics** (no selected stock provides them): cleared from form unless user manually edited
3. **Non-compound defaults**: Use the first selected stock's value
4. **Compound defaults** (`shouldCompound = true`, number-type only): Sum all stock values multiplied by their quantity: `sum(default.numericValue * stock.quantity)`

The `autoCompoundedMetricIds` set tracks which metrics were auto-filled by compounding. If the user manually edits a compounded value, it's removed from auto-recomputation.

### Stock usage submission

On form submit, stock selections are converted to `OccurrenceStockUsageInsert[]` and passed to `OccurrenceCreateFormContainer` or `OccurrenceUpdateFormContainer`:

- **Create**: `createOccurrenceStockUsages()` batch inserts, triggers decrement stock
- **Update**: Compares existing vs new usages, deletes removed ones, creates new ones, updates changed quantities

After stock usages are saved, `refreshHabitStocks(habitId)` is called to sync the store with the latest `remaining_items` and `usageCount` values.

## Data Flows

### Creating a stock

```
User opens HabitStockManager → clicks "Add stock"
  → AddStockForm: enter name, cost, currency, quantifiable toggle, metric defaults
  → on submit:
    1. stockActions.addStock(stockInsert, metricDefaultInserts)
    2. createStock() → DB insert → returns HabitStockWithDefaults
    3. createStockMetricDefaults() with new stock ID
    4. refreshHabitInStore() → getHabit() re-fetches habit with all stocks
```

### Using a stock when logging an occurrence

```
User selects habit → habit.stocks loaded
  → stock checkboxes appear in OccurrenceFormView
  → user selects stock(s), sets quantity
  → metric defaults auto-populate form
  → user submits
  → OccurrenceCreateFormContainer:
    1. Creates occurrence (with cost if quantifiable — see COSTS.md)
    2. createOccurrenceStockUsages(usages)
    3. DB triggers decrement remaining_items, may set is_depleted
    4. refreshHabitStocks() syncs store
```

### Editing stock metric defaults

```
User opens StockListItem → enters edit mode
  → StockMetricDefaults renders MetricValuesSection
  → user changes defaults and compound toggles
  → on save:
    1. stockActions.updateStockMetricDefaults()
    2. destroyStockMetricDefaults(stockId) — clears all existing
    3. createStockMetricDefaults(newDefaults) — inserts fresh
    4. refreshHabitInStore()
```

## Key Design Decisions

1. **Quantifiable vs. semi-quantifiable via nullability**: `total_items IS NULL` distinguishes the two types without a separate enum or boolean. This keeps the schema simple and the check constraints clean.

2. **Auto-depletion via DB triggers**: Stock quantity updates happen at the database level, not in application code. This is more reliable than client-side updates and handles edge cases (concurrent usage, direct DB edits).

3. **Destroy-and-recreate for metric defaults**: When updating stock metric defaults, all existing defaults are deleted and new ones inserted. This avoids complex diff logic for a small dataset.

4. **Refresh-after-mutate pattern**: After any stock mutation, the entire habit is re-fetched. This ensures `usageCount`, `remaining_items`, and `is_depleted` are always in sync with the database, since triggers may have changed values.

5. **Compound metric defaults**: The `shouldCompound` flag enables summing numeric defaults across multiple stocks, useful when multiple items contribute to the same metric (e.g., protein from multiple food stocks).
