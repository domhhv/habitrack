# Occurrence Costs

Occurrence costs track how much money each habit occurrence costs, derived from the stocks used. There are two calculation strategies depending on stock type (see [STOCKS.md](./STOCKS.md) for quantifiable vs. semi-quantifiable).

## Database

### Cost fields on `occurrences` table

Schema: [`supabase/schemas/06_occurrences.sql`](../supabase/schemas/06_occurrences.sql)

| Column     | Type          | Notes                                                      |
| ---------- | ------------- | ---------------------------------------------------------- |
| `cost`     | NUMERIC(10,2) | Nullable. Set for quantifiable stock costs, null otherwise |
| `currency` | TEXT          | Nullable. Set alongside `cost`                             |

These fields store the **aggregated cost from quantifiable stocks** at logging time. Semi-quantifiable stock costs are not stored here — they are calculated on display.

### Related tables

- `habit_stocks.cost` / `habit_stocks.currency` — the total cost of a stock (see [STOCKS.md](./STOCKS.md))
- `habit_stocks.total_items` — needed for per-item cost calculation
- `habit_stocks.is_depleted` / `occurrence_stock_usages.quantity` — needed for average cost calculation
- `HabitStockWithDefaults.usageCount` — aggregated count of usage records per stock

## Calculation Strategies

### Strategy 1: Quantifiable stocks (at logging time)

For stocks with `total_items IS NOT NULL`:

```
cost_per_item = stock.cost / stock.total_items
occurrence_cost = cost_per_item * usage.quantity
```

**Example**: Stock costs EUR 10 for 20 pouches, user uses 2 pouches → EUR 1.00

- Calculated in [`OccurrenceCreateFormContainer.tsx`](../src/components/occurrence/OccurrenceCreateFormContainer.tsx) at lines 104-143
- Result stored in `occurrence.cost` and `occurrence.currency`
- Only stored if all stock costs share the **same currency** (see [Multi-Currency](#multi-currency-handling))

### Strategy 2: Semi-quantifiable stocks (on display, after depletion)

For stocks with `total_items IS NULL`:

```
avg_cost_per_occurrence = stock.cost / stock.usageCount
```

**Example**: Stock costs EUR 25, used in 5 occurrences → avg EUR 5.00/occurrence

- **Not stored** in the occurrence — calculated dynamically when rendering
- Only calculated when `stock.isDepleted === true` (before depletion, per-occurrence cost is unknown)
- Displayed in `OccurrenceListItem` and `CalendarPeriodSummary`

### When no cost is available

Cost is null/not displayed when:

- Stock has no `cost` set
- Quantifiable stock hasn't been used yet (no usages)
- Semi-quantifiable stock is not yet depleted
- Stocks use mixed currencies (see below)

## Multi-Currency Handling

File: [`OccurrenceCreateFormContainer.tsx`](../src/components/occurrence/OccurrenceCreateFormContainer.tsx) (lines 130-143)

When an occurrence uses multiple stocks:

```typescript
const currencies = new Set(costEntries.map((entry) => entry.currency));

if (currencies.size === 1) {
  // Single currency: sum all costs, store in occurrence
  cost = costEntries.reduce((sum, entry) => sum + entry.amount, 0);
  currency = costEntries[0].currency;
}
// Multi-currency: occurrence.cost stays null
```

- If all quantifiable stocks share the same currency → costs are summed and stored
- If stocks use different currencies → `occurrence.cost` is left null
- Semi-quantifiable stock costs are always displayed per-stock with their own currency

## Types

In [`src/models/occurrence.model.ts`](../src/models/occurrence.model.ts):

```typescript
type OccurrenceSummaryItem = {
  costByCurrency: Record<string, number>; // Aggregated costs by currency for a period
  count: number;
  habitId: string;
  // ...
};
```

The `costByCurrency` field is computed by [`src/utils/build-occurrence-summary.ts`](../src/utils/build-occurrence-summary.ts) — it sums `occurrence.cost` values grouped by `occurrence.currency` for all occurrences of a habit in a period.

## Cost Display

### Per-occurrence display

File: [`src/components/occurrence/OccurrenceListItem.tsx`](../src/components/occurrence/OccurrenceListItem.tsx)

Two cost sections:

1. **Direct cost** (from `occurrence.cost`): Displayed as "Spent EUR X.XX" using `formatCost()` (which uses `Intl.NumberFormat`). Only shown if `occurrence.cost` is not null.

2. **Depleted stock average costs**: For each stock used in this occurrence that is now depleted, shows "{stock name}: avg EUR X.XX/occurrence". Calculated as `stock.cost / stock.usageCount`. Only shown for depleted stocks with a cost.

### Period summary display

File: [`src/components/calendar/CalendarPeriodSummary.tsx`](../src/components/calendar/CalendarPeriodSummary.tsx)

Two cost sections per habit:

1. **Aggregated direct costs** (from `OccurrenceSummaryItem.costByCurrency`): Sums all `occurrence.cost` values by currency for the period. Displayed per currency.

2. **Depleted stock costs for period**: For each depleted stock with usages in the period:
   - `avgCost = stock.cost / stock.usageCount`
   - `totalCost = avgCost * occurrenceCountInPeriod`
   - Displayed as "{stock name}: EUR X.XX (avg EUR Y.YY/occurrence)"

## Cost Aggregation

File: [`src/utils/build-occurrence-summary.ts`](../src/utils/build-occurrence-summary.ts)

```typescript
const buildOccurrenceSummary = (occurrencesById) => {
  // Groups occurrences by habitId
  // For each habit's occurrences:
  //   Sums occurrence.cost by occurrence.currency → costByCurrency
  // Returns OccurrenceSummaryItem[]
};
```

This only aggregates stored costs (from quantifiable stocks). Depleted stock average costs are calculated separately in the display components.

## Data Flow

### Logging an occurrence with cost

```
User submits occurrence form with stock selections
  → OccurrenceCreateFormContainer:
    1. For each quantifiable stock usage:
       cost_entry = (stock.cost / stock.totalItems) * quantity
    2. If all entries share same currency:
       occurrence.cost = sum(cost_entries)
       occurrence.currency = shared_currency
    3. Else: occurrence.cost = null
    4. Create occurrence with cost/currency
    5. Create stock usages (triggers update remaining_items)
    6. Refresh habit stocks in store
```

### Viewing occurrence cost

```
OccurrenceListItem renders:
  1. If occurrence.cost !== null → "Spent {formatCost(cost, currency)}"
  2. For each stockUsage:
     → look up stock in habit.stocks
     → if stock.isDepleted && stock.cost:
        → show "avg {stock.cost / stock.usageCount}/occurrence"
```

### Viewing period cost summary

```
CalendarPeriodSummary receives occurrenceSummary:
  1. Direct costs: iterate costByCurrency → display per currency
  2. Stock costs: for each habit's depleted stocks with usages in period:
     → avgCost = stock.cost / stock.usageCount
     → totalCost = avgCost * habit occurrence count in period
     → display "{stock}: {totalCost} (avg {avgCost}/occurrence)"
```

## Key Design Decisions

1. **Store quantifiable costs, calculate semi-quantifiable dynamically**: Quantifiable costs are known at logging time and stored for fast aggregation. Semi-quantifiable costs depend on future usage counts and can only be calculated after depletion, so they're always computed on-the-fly.

2. **Null cost for mixed currencies**: Rather than inventing exchange rates or storing per-currency breakdowns on the occurrence, mixed-currency scenarios simply leave `occurrence.cost` as null. Individual stock costs remain visible in the depleted stock display.

3. **Two-tier display**: Direct costs (stored) and average costs (computed) are displayed separately in both per-occurrence and period views, making it clear which costs are exact and which are averages.
