import { cn, Chip } from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import { CustomButton, InfinityLoader } from '@components';
import type {
  Habit,
  Occurrence,
  MetricValue,
  HabitStockWithDefaults,
} from '@models';
import {
  useHabits,
  useMetricsActions,
  useConfirmationActions,
  useNotesByOccurrenceId,
} from '@stores';
import { matchMetricValue, handleAsyncAction } from '@utils';

import OccurrenceChip from './OccurrenceChip';

const formatMetricValue = (
  metric: Habit['metricDefinitions'][number],
  value: MetricValue | undefined
): string => {
  if (value === undefined) {
    return '';
  }

  return matchMetricValue(metric.type, value, {
    boolean: ({ booleanValue }) => {
      const config = metric.type === 'boolean' ? metric.config : undefined;

      return booleanValue
        ? config?.trueLabel || 'Yes'
        : config?.falseLabel || 'No';
    },
    choice: (choiceValue) => {
      return 'selectedOptions' in choiceValue
        ? choiceValue.selectedOptions.join(', ')
        : choiceValue.selectedOption;
    },
    duration: ({ durationMs }) => {
      const totalSec = Math.floor(durationMs / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const format =
        metric.type === 'duration' ? metric.config.format : undefined;

      if (format === 'minutes') {
        return `${Math.floor(durationMs / 60000)} min`;
      }

      if (format === 'seconds') {
        return `${totalSec} sec`;
      }

      if (format === 'hh:mm:ss') {
        return `${h}h ${m}m ${s}s`;
      }

      return `${h}h ${m}m`;
    },
    number: ({ numericValue }) => {
      return metric.type === 'number' && metric.config.unit
        ? `${numericValue} ${metric.config.unit}`
        : String(numericValue);
    },
    percentage: ({ numericValue }) => {
      return `${numericValue}%`;
    },
    range: ({ rangeFrom, rangeTo }) => {
      const unit =
        metric.type === 'range' && metric.config.unit
          ? ` ${metric.config.unit}`
          : '';

      return `${rangeFrom}–${rangeTo}${unit}`;
    },
    scale: ({ numericValue }) => {
      const label =
        metric.type === 'scale'
          ? metric.config.labels?.[String(numericValue)]
          : undefined;

      return label ? `${numericValue} (${label})` : String(numericValue);
    },
    text: ({ textValue }) => {
      return textValue;
    },
  });
};

const formatCost = (cost: number | null, currency: string | null) => {
  if (cost === null || !currency) {
    return null;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      currency,
      style: 'currency',
    }).format(cost);
  } catch {
    return `${cost} ${currency}`;
  }
};

type OccurrenceListItemProps = {
  hasChip: boolean;
  isBeingRemoved: boolean;
  occurrence: Occurrence;
  onEdit: () => void;
  onRemove: () => void;
};

const OccurrenceListItem = ({
  hasChip,
  isBeingRemoved,
  occurrence,
  onEdit,
  onRemove,
}: OccurrenceListItemProps) => {
  const notes = useNotesByOccurrenceId();
  const habits = useHabits();
  const stocksById = React.useMemo(() => {
    const habit = habits[occurrence.habitId];

    if (!habit) {
      return new Map<string, HabitStockWithDefaults>();
    }

    return new Map(
      habit.stocks.map((stock) => {
        return [stock.id, stock];
      })
    );
  }, [habits, occurrence.habitId]);
  const { removeMetricValue } = useMetricsActions();
  const { askConfirmation } = useConfirmationActions();
  const [removingMetricId, setRemovingMetricId] = React.useState<string | null>(
    null
  );
  const timeFormatter = useDateFormatter({
    hour: 'numeric',
    minute: 'numeric',
    timeZone: getLocalTimeZone(),
  });

  const handleRemoveMetricValue = async (habitMetricId: string) => {
    if (
      await askConfirmation({
        confirmText: 'Delete',
        description: 'Are you sure you want to delete this metric value?',
        title: 'Delete metric value',
        variant: 'danger',
      })
    ) {
      setRemovingMetricId(habitMetricId);

      handleAsyncAction(
        removeMetricValue(occurrence.id, habitMetricId),
        'remove_metric-value'
      ).finally(() => {
        setRemovingMetricId(null);
      });
    }
  };

  const metricChips = React.useMemo(() => {
    const definitions = occurrence.habit.metricDefinitions;
    const values = occurrence.metricValues;

    if (definitions.length === 0 || values.length === 0) {
      return [];
    }

    const valuesByMetricId = new Map(
      values.map((v) => {
        return [v.habitMetricId, v.value];
      })
    );

    return definitions
      .filter((d) => {
        return valuesByMetricId.has(d.id);
      })
      .map((d) => {
        return {
          id: d.id,
          label: `${d.name}: ${formatMetricValue(d, valuesByMetricId.get(d.id))}`,
        };
      });
  }, [occurrence.habit.metricDefinitions, occurrence.metricValues]);

  const occurrenceNote = React.useMemo(() => {
    return notes[occurrence.id];
  }, [notes, occurrence]);

  const formattedCost = React.useMemo(() => {
    return formatCost(occurrence.cost ?? null, occurrence.currency ?? null);
  }, [occurrence.cost, occurrence.currency]);

  const usedStockItems = React.useMemo(() => {
    return occurrence.stockUsages
      .map((usage) => {
        const stock = stocksById.get(usage.habitStockId);

        if (!stock) {
          return null;
        }

        return {
          habitStockId: usage.habitStockId,
          name: stock.name,
          quantity: usage.quantity,
        };
      })
      .filter((entry) => {
        return entry !== null;
      });
  }, [occurrence.stockUsages, stocksById]);

  const depletedStockCosts = React.useMemo(() => {
    return occurrence.stockUsages
      .map((usage) => {
        const stock = stocksById.get(usage.habitStockId);

        if (
          !stock ||
          !stock.isDepleted ||
          stock.cost === null ||
          stock.usageCount === 0 ||
          stock.totalItems !== null
        ) {
          return null;
        }

        return {
          avgCost: formatCost(stock.cost / stock.usageCount, stock.currency),
          habitStockId: usage.habitStockId,
          name: stock.name,
        };
      })
      .filter((entry) => {
        return entry !== null;
      });
  }, [occurrence.stockUsages, stocksById]);

  return (
    <li
      key={occurrence.id}
      className={cn(
        'border-border text-foreground py-2 not-last:border-b',
        hasChip && occurrenceNote && 'pb-1'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            hasChip ? 'space-y-1 space-x-2' : 'whitespace-pre-wrap'
          )}
        >
          {!hasChip && (
            <>
              {occurrence.hasSpecificTime && (
                <span className="font-semibold">
                  {timeFormatter.format(occurrence.occurredAt.toDate())}:{' '}
                </span>
              )}
              <span className={cn(!occurrenceNote && 'text-muted italic')}>
                {occurrenceNote?.content || 'No note'}
              </span>
            </>
          )}
          {hasChip && (
            <>
              <div className="flex items-center gap-2">
                <OccurrenceChip
                  hasMargin={false}
                  hasCounter={false}
                  hasTooltip={false}
                  isClickable={false}
                  isHabitNameShown={true}
                  occurrences={[occurrence]}
                />
                {occurrence.hasSpecificTime && (
                  <span className="font-semibold">
                    {timeFormatter.format(occurrence.occurredAt.toDate())}
                  </span>
                )}
              </div>
              {occurrenceNote && (
                <div className="text-sm whitespace-pre-wrap">
                  <span className="italic">{occurrenceNote.content}</span>
                </div>
              )}
            </>
          )}
          {metricChips.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {metricChips.map((chip) => {
                const isRemoving = removingMetricId === chip.id;

                return (
                  <Chip key={chip.id} className="gap-2">
                    {chip.label}
                    {isRemoving ? (
                      <InfinityLoader size={16} color="var(--danger)" />
                    ) : (
                      <CustomButton
                        size="sm"
                        isIconOnly
                        variant="ghost"
                        aria-label="delete-metric-value"
                        className="text-danger ml-0.5 h-4 w-4 min-w-0"
                        onPress={() => {
                          return handleRemoveMetricValue(chip.id);
                        }}
                      >
                        <TrashSimpleIcon size={10} />
                      </CustomButton>
                    )}
                  </Chip>
                );
              })}
            </div>
          )}
          {formattedCost && (
            <div className="text-foreground text-tiny pt-1">
              Spent {formattedCost}
            </div>
          )}
          {usedStockItems.length > 0 && (
            <div className="text-foreground text-tiny flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
              {usedStockItems.map((item) => {
                return (
                  <span key={item.habitStockId}>
                    {item.name}
                    {item.quantity !== null &&
                      item.quantity > 1 &&
                      ` ×${item.quantity}`}
                  </span>
                );
              })}
            </div>
          )}
          {depletedStockCosts.length > 0 && (
            <div className="text-foreground text-tiny flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
              {depletedStockCosts.map((entry) => {
                return (
                  <span key={entry.habitStockId}>
                    {entry.name}: avg {entry.avgCost}/occurrence
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CustomButton
            size="sm"
            isIconOnly
            variant="light"
            onPress={onEdit}
            isDisabled={isBeingRemoved}
            aria-label="edit-habit-entry"
          >
            <PencilSimpleIcon size={14} weight="bold" />
          </CustomButton>
          <CustomButton
            size="sm"
            isIconOnly
            onPress={onRemove}
            variant="danger-soft"
            isPending={isBeingRemoved}
            aria-label="delete-habit-entry"
          >
            <TrashSimpleIcon weight="bold" />
          </CustomButton>
        </div>
      </div>
    </li>
  );
};

export default OccurrenceListItem;
