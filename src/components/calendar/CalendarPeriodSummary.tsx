import { Button } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import { NoteIcon, NotePencilIcon } from '@phosphor-icons/react';
import React from 'react';

import type {
  NoteOfPeriod,
  NotePeriodKind,
  OccurrenceSummaryItem,
} from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useHabits, useNoteDrawerActions } from '@stores';

type CalendarPeriodSummaryProps = {
  date: CalendarDate | null;
  kind: NonNullable<NotePeriodKind>;
  metricTotals: Record<string, { formattedTotal: string; name: string }[]>;
  note: NoteOfPeriod | undefined;
  occurrenceSummary: OccurrenceSummaryItem[];
};

const CalendarPeriodSummary = ({
  date,
  kind,
  metricTotals,
  note,
  occurrenceSummary,
}: CalendarPeriodSummaryProps) => {
  const { openNoteDrawer } = useNoteDrawerActions();
  const habits = useHabits();

  const stockCostsByHabit = React.useMemo(() => {
    const result: Record<
      string,
      { avgCost: number; currency: string; name: string; totalCost: number }[]
    > = {};

    for (const { count, habitId, occurrences } of occurrenceSummary) {
      const habitStocks = habits[habitId]?.stocks ?? [];
      const stocksById = new Map(
        habitStocks.map((s) => {
          return [s.id, s] as const;
        })
      );
      const seen = new Set<string>();

      for (const occurrence of occurrences) {
        for (const usage of occurrence.stockUsages) {
          if (seen.has(usage.habitStockId)) {
            continue;
          }

          seen.add(usage.habitStockId);
          const stock = stocksById.get(usage.habitStockId);

          if (
            !stock ||
            !stock.isDepleted ||
            stock.cost === null ||
            stock.usageCount === 0
          ) {
            continue;
          }

          const avgCost = stock.cost / stock.usageCount;
          const entries = result[habitId] ?? [];

          entries.push({
            avgCost,
            currency: stock.currency,
            name: stock.name,
            totalCost: avgCost * count,
          });
          result[habitId] = entries;
        }
      }
    }

    return result;
  }, [occurrenceSummary, habits]);

  return (
    <>
      {note && date && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <NoteIcon size={16} weight="bold" className="text-primary-500" />
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Note
            </h4>
            <Button
              size="sm"
              isIconOnly
              variant="ghost"
              aria-label="Edit weekly note"
              className="text-accent h-5 w-5 min-w-fit"
              onPress={() => {
                openNoteDrawer(date, kind);
              }}
            >
              <NotePencilIcon size={14} weight="bold" />
            </Button>
          </div>
          <p className="line-clamp-4 text-sm text-stone-500 dark:text-stone-400">
            {note.content}
          </p>
        </div>
      )}
      {!note && date && (
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            openNoteDrawer(date, kind);
          }}
        >
          <NotePencilIcon size={14} weight="bold" />
          Add note
        </Button>
      )}
      {occurrenceSummary.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            Summary
          </h4>
          <div className="space-y-1.5">
            {occurrenceSummary.map(
              ({
                costByCurrency,
                count,
                habitId,
                iconPath,
                name,
                traitColor,
              }) => {
                const totals = metricTotals[habitId];
                const costEntries = Object.entries(costByCurrency);
                const stockCosts = stockCostsByHabit[habitId];
                const hasDetails =
                  totals ||
                  costEntries.length > 0 ||
                  (stockCosts && stockCosts.length > 0);

                return (
                  <div key={habitId}>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                      <img
                        alt={name}
                        className="h-4 w-4"
                        style={{ borderColor: traitColor }}
                        src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
                      />
                      <span>
                        {name}: {count}
                      </span>
                    </div>
                    {hasDetails && (
                      <div className="mt-0.5 ml-6 space-y-0.5">
                        {totals?.map(({ formattedTotal, name: metricName }) => {
                          return (
                            <p
                              key={metricName}
                              className="text-xs text-stone-400 dark:text-stone-500"
                            >
                              {metricName}: {formattedTotal}
                            </p>
                          );
                        })}
                        {costEntries.map(([currency, total]) => {
                          return (
                            <p
                              key={currency}
                              className="text-xs text-stone-400 dark:text-stone-500"
                            >
                              Cost:{' '}
                              {new Intl.NumberFormat(undefined, {
                                currency,
                                style: 'currency',
                              }).format(total)}
                            </p>
                          );
                        })}
                        {stockCosts?.map((entry) => {
                          const formatter = new Intl.NumberFormat(undefined, {
                            currency: entry.currency,
                            style: 'currency',
                          });

                          return (
                            <p
                              key={entry.name}
                              className="text-xs text-stone-400 dark:text-stone-500"
                            >
                              {entry.name}: {formatter.format(entry.totalCost)}{' '}
                              (avg {formatter.format(entry.avgCost)}/occurrence)
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarPeriodSummary;
