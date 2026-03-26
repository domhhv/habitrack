# Metrics

Habit metrics let users attach configurable measurement definitions to habits. When logging an occurrence, users enter values for each metric. This document covers both **habit metric definitions** (the schema) and **occurrence metric values** (the data).

## Database

### `habit_metrics` table

Schema: [`supabase/schemas/08_habit_metrics.sql`](../supabase/schemas/08_habit_metrics.sql)

| Column        | Type               | Notes                                        |
| ------------- | ------------------ | -------------------------------------------- |
| `id`          | UUID               | PK                                           |
| `user_id`     | UUID               | FK `auth.users`                              |
| `habit_id`    | UUID               | FK `habits` (CASCADE DELETE)                 |
| `name`        | TEXT               | Non-empty check                              |
| `type`        | `metric_type` enum | See [Metric Types](#metric-types)            |
| `config`      | JSONB              | Type-specific configuration, default `{}`    |
| `sort_order`  | INTEGER            | Display ordering within a habit, default `0` |
| `is_required` | BOOLEAN            | Default `false`                              |
| `created_at`  | TIMESTAMPTZ        |                                              |
| `updated_at`  | TIMESTAMPTZ        | Auto-set via trigger                         |

Indexes: `idx_habit_metrics_user_id`, `idx_habit_metrics_habit_id`

### `occurrence_metric_values` table

Schema: [`supabase/schemas/09_occurrence_metric_values.sql`](../supabase/schemas/09_occurrence_metric_values.sql)

| Column            | Type        | Notes                               |
| ----------------- | ----------- | ----------------------------------- |
| `id`              | UUID        | PK                                  |
| `user_id`         | UUID        | FK `auth.users`                     |
| `occurrence_id`   | UUID        | FK `occurrences` (CASCADE DELETE)   |
| `habit_metric_id` | UUID        | FK `habit_metrics` (CASCADE DELETE) |
| `value`           | JSONB       | Type-specific value shape           |
| `created_at`      | TIMESTAMPTZ |                                     |
| `updated_at`      | TIMESTAMPTZ | Auto-set via trigger                |

**Unique constraint**: `(occurrence_id, habit_metric_id)` - one value per metric per occurrence. This enables the upsert strategy used by the service layer.

Indexes: `idx_occurrence_metric_values_user_id`, `idx_occurrence_metric_values_occurrence_id`, `idx_occurrence_metric_values_habit_metric_id`

### Relationships

- Deleting a **habit** cascades to its `habit_metrics`, which cascades to `occurrence_metric_values`.
- Deleting an **occurrence** cascades to its `occurrence_metric_values`.
- Deleting a **metric definition** cascades to all its recorded values.

## Metric Types

The `metric_type` enum defines 8 types. Each has its own **config** shape (stored in `habit_metrics.config`) and **value** shape (stored in `occurrence_metric_values.value`).

All types defined in [`src/models/metric.model.ts`](../src/models/metric.model.ts):

| Type         | Config Type              | Value Type                                            | Config Fields                                                                                | Value Fields                                  |
| ------------ | ------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `number`     | `NumberMetricConfig`     | `NumericMetricValue`                                  | `unit?`, `min?`, `max?`, `decimalPlaces?`, `preset?`                                         | `{ numericValue: number }`                    |
| `duration`   | `DurationMetricConfig`   | `DurationMetricValue`                                 | `format?`: `'hh:mm'` \| `'hh:mm:ss'` \| `'mm:ss'` \| `'hours'` \| `'minutes'` \| `'seconds'` | `{ durationMs: number }`                      |
| `percentage` | `PercentageMetricConfig` | `NumericMetricValue`                                  | (empty)                                                                                      | `{ numericValue: number }`                    |
| `scale`      | `ScaleMetricConfig`      | `NumericMetricValue`                                  | `min`, `max`, `step`, `labels?`                                                              | `{ numericValue: number }`                    |
| `range`      | `RangeMetricConfig`      | `RangeMetricValue`                                    | `unit?`, `min?`, `max?`, `continueFromLast?`                                                 | `{ rangeFrom: number, rangeTo: number }`      |
| `choice`     | `ChoiceMetricConfig`     | `SingleChoiceMetricValue` or `MultiChoiceMetricValue` | `options: string[]`, `allowMultiple?`                                                        | `{ selectedOption }` or `{ selectedOptions }` |
| `boolean`    | `BooleanMetricConfig`    | `BooleanMetricValue`                                  | `trueLabel?`, `falseLabel?`                                                                  | `{ booleanValue: boolean }`                   |
| `text`       | `TextMetricConfig`       | `TextMetricValue`                                     | `maxLength?`, `multiline?`, `placeholder?`                                                   | `{ textValue: string }`                       |

### Metric Presets

Defined as `METRIC_PRESETS` in [`src/constants.ts`](../src/constants.ts). Presets provide quick setup for common measurements, grouped by category (Duration, Distance, Weight, Volume, Energy, Temperature, etc.). Each preset is `{ name, type, config }` and auto-fills the metric definition form.

## Types & Models

File: [`src/models/metric.model.ts`](../src/models/metric.model.ts)

| Type                          | Purpose                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `MetricType`                  | Union of the 8 metric type strings                                 |
| `MetricConfig`                | Union of all config types                                          |
| `MetricValue`                 | Union of all value types                                           |
| `HabitMetric`                 | CamelCased row from `habit_metrics`                                |
| `HabitMetricInsert`           | Insert type                                                        |
| `HabitMetricUpdate`           | Update type                                                        |
| `OccurrenceMetricValue`       | CamelCased row from `occurrence_metric_values`                     |
| `OccurrenceMetricValueInsert` | Insert type for upsert operations                                  |
| `FormMetricDefinitions`       | Client-side form state (see [Form State Flags](#form-state-flags)) |
| `MetricPreset`                | `{ name, type, config }` for preset selection                      |

### Integration with Habit and Occurrence models

In [`src/models/habit.model.ts`](../src/models/habit.model.ts):

```typescript
type Habit = BaseHabit & {
  metricDefinitions: Omit<HabitMetric, 'habitId' | 'userId'>[];
  // ...
};
```

In [`src/models/occurrence.model.ts`](../src/models/occurrence.model.ts):

```typescript
type RawOccurrence = BaseOccurrence & {
  metricValues: Omit<OccurrenceMetricValue, 'userId' | 'occurrenceId'>[];
  // ...
};
```

Both are eagerly loaded via nested Supabase selects in the habits and occurrences services.

## Service Layer

File: [`src/services/metrics.service.ts`](../src/services/metrics.service.ts)

| Function              | Signature                                                                     | Notes                                                 |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `createHabitMetrics`  | `(metrics: HabitMetricInsert[]) => Promise<HabitMetric[]>`                    | Batch insert                                          |
| `patchHabitMetric`    | `(id, body: HabitMetricUpdate) => Promise<HabitMetric>`                       | Single update                                         |
| `destroyHabitMetrics` | `(ids: string[]) => Promise<void>`                                            | Batch delete (cascades to values)                     |
| `upsertMetricValues`  | `(values: OccurrenceMetricValueInsert[]) => Promise<OccurrenceMetricValue[]>` | Upsert on `(occurrence_id, habit_metric_id)` conflict |
| `destroyMetricValue`  | `(occurrenceId, habitMetricId) => Promise<void>`                              | Delete specific value                                 |

### Eager loading in related services

- [`src/services/habits.service.ts`](../src/services/habits.service.ts): `HABIT_SELECT` includes `metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required, ...)`
- [`src/services/occurrences.service.ts`](../src/services/occurrences.service.ts): Occurrence queries include `metric_values:occurrence_metric_values(id, value, habit_metric_id, ...)`

## State Management

File: [`src/stores/metrics.store.ts`](../src/stores/metrics.store.ts)

Hook: `useMetricsActions()` returns all actions.

| Action                                           | What it does                                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `addHabitMetrics(metrics)`                       | Creates metrics, pushes to `habits[habitId].metricDefinitions`, propagates to all related occurrences |
| `removeHabitMetrics(ids, habitId)`               | Deletes metrics, removes from habit and cleans up metric values from all related occurrences          |
| `updateHabitMetric(id, metric)`                  | Patches metric definition across habit and all occurrences                                            |
| `saveMetricValues(values)`                       | Upserts metric values, updates both `occurrences` and `occurrencesByDate`                             |
| `removeMetricValue(occurrenceId, habitMetricId)` | Removes a specific metric value from occurrence                                                       |

All actions update three data structures in the store: `habits`, `occurrences` (array), and `occurrencesByDate` (date-indexed map).

## UI Components

All in [`src/components/metric/`](../src/components/metric/):

### MetricDefinitionForm

File: [`MetricDefinitionForm.tsx`](../src/components/metric/MetricDefinitionForm.tsx)

Used inside `EditHabitDialog` to create/edit/remove metric definitions for a habit.

- Preset selection via Autocomplete (from `METRIC_PRESETS`)
- Metric name, type, and type-specific config fields
- Required toggle
- Visual state indicators (New, To be updated, To be removed)
- Edit/Delete buttons

### MetricConfigFields

File: [`MetricConfigFields.tsx`](../src/components/metric/MetricConfigFields.tsx)

Renders type-specific configuration UI for each metric type (e.g., unit/min/max for number, format buttons for duration, option inputs for choice).

### MetricValueInput

File: [`MetricValueInput.tsx`](../src/components/metric/MetricValueInput.tsx)

Renders the appropriate input control for entering a metric value when logging an occurrence. Each type gets a specialized input (NumberInput, Slider, time fields, chip buttons, Switch, etc.).

Accepts a `previousValue` prop to support the "continue from last" feature for range metrics.

### MetricValuesSection

File: [`MetricValuesSection.tsx`](../src/components/metric/MetricValuesSection.tsx)

Container that renders all `MetricValueInput` components for a given occurrence. Props: `metricDefinitions`, `values`, `previousValues?`, `onChange`.

## Form State Flags

The `FormMetricDefinitions` type adds client-side state flags to metric definitions for managing pending changes in the `EditHabitDialog`:

| Flag            | Meaning                                                 |
| --------------- | ------------------------------------------------------- |
| `isBeingEdited` | Currently in edit mode                                  |
| `isPersisted`   | Already exists in database                              |
| `isToBeAdded`   | New metric, will be created on submit                   |
| `isToBeUpdated` | Existing metric with changes, will be patched on submit |
| `isToBeRemoved` | Marked for deletion on submit                           |

On submit, the dialog processes these flags in order: remove marked metrics, create new metrics, update changed metrics.

## Data Flows

### Defining metrics (Edit Habit Dialog)

```
EditHabitDialog loads habit.metricDefinitions
  → converts to FormMetricDefinitions[] with state flags
  → user adds/edits/removes via MetricDefinitionForm
  → on submit:
    1. removeHabitMetrics(idsToRemove, habitId)
    2. addHabitMetrics(metricsToAdd)
    3. updateHabitMetric(id, changes) for each updated metric
```

### Logging occurrence with metric values

```
User selects habit in OccurrenceFormView
  → load habit.metricDefinitions
  → fetch previous occurrence's values (for continue-from-last)
  → if stocks selected: auto-populate number metrics from stock defaults (see STOCKS.md)
  → render MetricValuesSection with MetricValueInput per metric
  → user enters values → metricValues: Record<metricId, MetricValue | undefined>
  → on submit:
    → OccurrenceCreateFormContainer builds OccurrenceMetricValueInsert[]
    → saveMetricValues() upserts to occurrence_metric_values
```

### Updating occurrence metric values

Same flow but existing values are pre-loaded into form state. The upsert strategy via the unique constraint handles create-or-update seamlessly.

## Metric Totals Aggregation

File: [`src/utils/build-metric-totals.ts`](../src/utils/build-metric-totals.ts)

Calculates summed totals for `number` and `duration` metrics across occurrences in a period. Used by `CalendarPeriodSummary` to display aggregated stats.

- Only sums `number` (via `numericValue`) and `duration` (via `durationMs`) types
- Formats output with units and duration format strings
- Returns `Record<habitId, Array<{ name, formattedTotal }>>`

## Key Design Decisions

1. **JSONB for config and values**: Allows each metric type to have its own shape without separate tables per type. Type safety is maintained at the TypeScript level via discriminated union types.

2. **Upsert on unique constraint**: The `(occurrence_id, habit_metric_id)` unique constraint enables safe create-or-update semantics without manual delete/insert logic.

3. **Form state flags pattern**: Client-side tracking of pending changes (add/update/remove) prevents premature partial database updates. All changes are committed atomically on dialog submit.

4. **Eager loading**: Metric definitions are loaded as part of habits, metric values as part of occurrences, avoiding N+1 queries.

5. **Sort order**: Explicit `sort_order` column allows user-controlled display ordering independent of creation time.
