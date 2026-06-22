# Metrics

Habit metrics let users attach configurable measurement definitions to habits. When logging an occurrence, users enter values for each metric. This document covers both **habit metric definitions** (the schema) and **occurrence metric values** (the data).

## Database

### `habit_metrics` table

Schema: [`supabase/schemas/08_habit_metrics.sql`](../supabase/schemas/08_habit_metrics.sql)

| Column        | Type               | Notes                                                                                                                           |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | UUID               | PK                                                                                                                              |
| `user_id`     | UUID               | FK `auth.users`                                                                                                                 |
| `habit_id`    | UUID               | FK `habits` (CASCADE DELETE)                                                                                                    |
| `name`        | TEXT               | Non-empty check                                                                                                                 |
| `type`        | `metric_type` enum | See [Metric Types](#metric-types)                                                                                               |
| `config`      | JSONB              | Type-specific configuration, default `{}`. Shape validated against `type` by a CHECK constraint (see [Validation](#validation)) |
| `sort_order`  | INTEGER            | Display ordering within a habit, default `0`                                                                                    |
| `is_required` | BOOLEAN            | Default `false`                                                                                                                 |
| `created_at`  | TIMESTAMPTZ        |                                                                                                                                 |
| `updated_at`  | TIMESTAMPTZ        | Auto-set via trigger                                                                                                            |

Indexes: `idx_habit_metrics_user_id`, `idx_habit_metrics_habit_id`

### `occurrence_metric_values` table

Schema: [`supabase/schemas/09_occurrence_metric_values.sql`](../supabase/schemas/09_occurrence_metric_values.sql)

| Column            | Type        | Notes                                                                                                                              |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | UUID        | PK                                                                                                                                 |
| `user_id`         | UUID        | FK `auth.users`                                                                                                                    |
| `occurrence_id`   | UUID        | FK `occurrences` (CASCADE DELETE)                                                                                                  |
| `habit_metric_id` | UUID        | FK `habit_metrics` (CASCADE DELETE)                                                                                                |
| `value`           | JSONB       | Type-specific value shape. Validated against the metric's `type` by a BEFORE INSERT/UPDATE trigger (see [Validation](#validation)) |
| `created_at`      | TIMESTAMPTZ |                                                                                                                                    |
| `updated_at`      | TIMESTAMPTZ | Auto-set via trigger                                                                                                               |

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

| Type                          | Purpose                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MetricType`                  | Union of the 8 metric type strings                                                                                                                                                                |
| `MetricConfigByType`          | Map from each `MetricType` to its config type (e.g. `number → NumberMetricConfig`)                                                                                                                |
| `MetricValueByType`           | Map from each `MetricType` to its value type (e.g. `range → RangeMetricValue`)                                                                                                                    |
| `MetricConfig`                | Union of all config types (`MetricConfigByType[MetricType]`)                                                                                                                                      |
| `MetricValue`                 | Union of all value types (`MetricValueByType[MetricType]`) — **structural**, narrowed by shape, not `type`                                                                                        |
| `HabitMetric`                 | Discriminated union keyed on `type`: narrowing `metric.type` narrows `metric.config`                                                                                                              |
| `HabitMetricInsert`           | Insert type, also discriminated on `type`/`config`                                                                                                                                                |
| `HabitMetricUpdate`           | Update type (partial; not discriminated)                                                                                                                                                          |
| `OccurrenceMetricValue`       | CamelCased row from `occurrence_metric_values`, with `value` typed as `MetricValue` (not `Json`)                                                                                                  |
| `OccurrenceMetricValueInsert` | Insert type for upsert operations, `value: MetricValue`                                                                                                                                           |
| `FormMetricDefinitions`       | Client-side form state — **not** discriminated; `config` is the plain `MetricConfig` union because `type`/`config` change independently while editing (see [Form State Flags](#form-state-flags)) |
| `MetricPreset`                | Discriminated `{ name, type, config }` for preset selection                                                                                                                                       |
| `DistributiveOmit<T, K>`      | `Omit` that distributes over a union, preserving discriminants (used by `Habit.metricDefinitions`)                                                                                                |

### Why `HabitMetric` is discriminated but `MetricValue` is not

`config` is always stored on the **same row** as `type` (`habit_metrics`), so `HabitMetric` is a `type`-keyed discriminated union — `switch (metric.type)` narrows `metric.config` with no cast.

`value` lives on **different tables** (`occurrence_metric_values`, `habit_stock_metric_defaults`) where the metric `type` is not co-located, so `MetricValue` cannot be discriminated by `type`. It stays a structural union, narrowed via `in` checks, the `matchMetricValue` helper, or the `is*Value` guards (see [Type-safe access](#type-safe-access)).

### Type-safe access

File: [`src/utils/metric-value.ts`](../src/utils/metric-value.ts)

This module is the single place metric `config`/`value` shapes are narrowed. Because the discriminated types require correlated `type`/`config` (and the DB stores `config`/`value` as `Json`), all narrowing goes through these helpers — there are **no `as` casts** for metric config/value/defaults anywhere in `src/`.

| Helper                                                | Use                                                                                                                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matchMetricValue(type, value, handlers)`             | Exhaustive dispatch: maps a `(type, value)` pair to its narrowed value type via a per-type handler map. Used by read sites like `formatMetricValue`.                                          |
| `isMetricValue(value)`                                | Structural guard: narrows `Json` → `MetricValue` (no `type` needed). Used where the metric type is not co-located (stock defaults).                                                           |
| `isMetricValueForType(type, value)`                   | Generic guard: narrows a value to `MetricValueByType[type]`. Used by the `MetricValueInput` dispatcher.                                                                                       |
| `isMetricConfigForType(type, config)`                 | Generic guard: narrows a config to `MetricConfigByType[type]`. Used by the config/value field dispatchers.                                                                                    |
| `isHabitMetric(metric)` / `parseHabitMetric`          | Whole-row guard / parser: validates a metric row's `config` against its `type`, narrowing the whole object so the discriminant is preserved. `parseHabitMetric` throws on malformed data.     |
| `parseMetricValueHolder(holder)`                      | Narrows the `value` field of any row (occurrence values, stock defaults) to `MetricValue`; throws on malformed data.                                                                          |
| `buildHabitMetricInsert(form, habitId, userId)`       | Builds a discriminated `HabitMetricInsert` from `FormMetricDefinitions` (spreads the validated metric so `type`/`config` stay correlated; re-listing the fields would decorrelate the union). |
| `isNumericValue` / `isDurationValue` / `isRangeValue` | Small structural guards for the common single-shape reads (totals, range continue-from-last).                                                                                                 |

The `parse*` helpers run at the **service boundary** (where camelcased DB rows enter the app) and throw on shape mismatch — defense-in-depth alongside the DB validation below.

### Integration with Habit and Occurrence models

In [`src/models/habit.model.ts`](../src/models/habit.model.ts):

```typescript
type Habit = BaseHabit & {
  // DistributiveOmit (not plain Omit) so each member keeps its `type`/`config`
  // discriminant — a plain Omit would collapse the union and break narrowing.
  metricDefinitions: DistributiveOmit<HabitMetric, 'habitId' | 'userId'>[];
  // ...
};
```

In [`src/models/occurrence.model.ts`](../src/models/occurrence.model.ts):

```typescript
type RawOccurrence = BaseOccurrence & {
  // OccurrenceMetricValue.value is MetricValue (not Json).
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

Services validate the JSON `config`/`value` of camelcased rows at the read boundary via the `parse*` helpers from [`metric-value.ts`](../src/utils/metric-value.ts) (see [Type-safe access](#type-safe-access)), which throw on a shape that doesn't match the metric `type`.

## Validation

JSON `config`/`value` shapes are enforced at two layers — the database (authoritative) and the app's read boundary (defense-in-depth). **JSON keys are stored camelCased** (the client write path decamelizes shallowly), so the DB checks use camelCase keys (`numericValue`, `durationMs`, `rangeFrom`, etc.).

### Database

- **`habit_metrics.config`** — a same-row CHECK constraint (`habit_metrics_config_shape_check` in [`08_habit_metrics.sql`](../supabase/schemas/08_habit_metrics.sql)) validates the config shape against `type`: `scale` requires numeric `min`/`max`/`step`; `choice` requires an `options` array; `percentage` must be `{}`; the all-optional types only require an object.
- **`occurrence_metric_values.value`** and **`habit_stock_metric_defaults.value`** — a `BEFORE INSERT OR UPDATE` trigger runs `validate_metric_value()` ([`02_functions.sql`](../supabase/schemas/02_functions.sql)), which looks up the metric `type` (these tables don't store it) and raises an exception if the value's JSON shape doesn't match. Triggers are attached in [`09_occurrence_metric_values.sql`](../supabase/schemas/09_occurrence_metric_values.sql) and [`12_habit_stock_metric_defaults.sql`](../supabase/schemas/12_habit_stock_metric_defaults.sql).

These guarantee the runtime invariant the TypeScript discriminated types assume, so the app never needs a defensive cast. Added in migration `..._add_metric_shape_validation.sql`.

### Generated `Json` type

Supabase generates a self-referential `Json` type whose deep recursion makes `camelcase-keys`' type inference exceed TypeScript's instantiation depth limit (`TS2589`). [`scripts/patch-json-type.mjs`](../scripts/patch-json-type.mjs) rewrites it to a non-recursive form after every `yarn db:gen-types` (the script is chained into that command). Metric `config`/`value` are narrowed from this `Json` to their concrete types by the helpers above.

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

Actions update the store's `habits`, `occurrences` (array), and `occurrencesByDate` (date-indexed map). Note: `saveMetricValues` and `removeMetricValue` only update `occurrences` and `occurrencesByDate`, as metric values are stored per occurrence, not in habit definitions.

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

1. **JSONB for config and values**: Allows each metric type to have its own shape without separate tables per type. Integrity is enforced at the database level (CHECK + `validate_metric_value` trigger, see [Validation](#validation)) and surfaced in TypeScript via the discriminated `HabitMetric`/`MetricConfig` types. Because `value`'s metric `type` is not co-located in its table, `MetricValue` is a structural union narrowed through the [`metric-value.ts`](../src/utils/metric-value.ts) helpers rather than a `type` discriminant. The net result is **no `as` casts** for metric config/value/defaults anywhere in `src/` — narrowing happens through exhaustive dispatch (`matchMetricValue`) and runtime guards/parsers that throw on malformed data.

2. **Upsert on unique constraint**: The `(occurrence_id, habit_metric_id)` unique constraint enables safe create-or-update semantics without manual delete/insert logic.

3. **Form state flags pattern**: Client-side tracking of pending changes (add/update/remove) prevents premature partial database updates. All changes are committed atomically on dialog submit.

4. **Eager loading**: Metric definitions are loaded as part of habits, metric values as part of occurrences, avoiding N+1 queries.

5. **Sort order**: Explicit `sort_order` column allows user-controlled display ordering independent of creation time.
