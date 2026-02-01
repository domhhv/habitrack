import { cn, Chip, Button, Spinner } from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import type {
  Occurrence,
  MetricValue,
  HabitMetric,
  MetricConfig,
  RangeMetricConfig,
  ScaleMetricConfig,
  NumberMetricConfig,
  BooleanMetricConfig,
  DurationMetricConfig,
} from '@models';
import { useNotesByOccurrenceId } from '@stores';

import OccurrenceChip from './OccurrenceChip';

const formatMetricValue = (metric: HabitMetric, value: MetricValue): string => {
  const config = metric.config as MetricConfig;

  switch (metric.type) {
    case 'number': {
      const numConfig = config as NumberMetricConfig;
      const v = (value as { numericValue: number }).numericValue;

      return numConfig.unit ? `${v} ${numConfig.unit}` : String(v);
    }

    case 'percentage': {
      const v = (value as { numericValue: number }).numericValue;

      return `${v}%`;
    }

    case 'duration': {
      const durConfig = config as DurationMetricConfig;
      const ms = (value as { durationMs: number }).durationMs;
      const totalSec = Math.floor(ms / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      if (durConfig.format === 'minutes') {
        return `${Math.floor(ms / 60000)} min`;
      }

      if (durConfig.format === 'seconds') {
        return `${totalSec} sec`;
      }

      if (durConfig.format === 'hh:mm:ss') {
        return `${h}h ${m}m ${s}s`;
      }

      return `${h}h ${m}m`;
    }

    case 'scale': {
      const scaleConfig = config as ScaleMetricConfig;
      const v = (value as { numericValue: number }).numericValue;
      const label = scaleConfig.labels?.[String(v)];

      return label ? `${v} (${label})` : String(v);
    }

    case 'range': {
      const rangeConfig = config as RangeMetricConfig;
      const { rangeFrom, rangeTo } = value as {
        rangeFrom: number;
        rangeTo: number;
      };
      const unit = rangeConfig.unit ? ` ${rangeConfig.unit}` : '';

      return `${rangeFrom}–${rangeTo}${unit}`;
    }

    case 'choice': {
      if ('selectedOptions' in value) {
        return (value as { selectedOptions: string[] }).selectedOptions.join(
          ', '
        );
      }

      return (value as { selectedOption: string }).selectedOption;
    }

    case 'boolean': {
      const boolConfig = config as BooleanMetricConfig;
      const v = (value as { booleanValue: boolean }).booleanValue;

      return v ? boolConfig.trueLabel || 'Yes' : boolConfig.falseLabel || 'No';
    }

    case 'text':
      return (value as { textValue: string }).textValue;

    default:
      return JSON.stringify(value);
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
  const timeFormatter = useDateFormatter({
    hour: 'numeric',
    minute: 'numeric',
    timeZone: getLocalTimeZone(),
  });
  const metricChips = React.useMemo(() => {
    const definitions = occurrence.habit.metricDefinitions;
    const values = occurrence.metricValues;

    if (definitions.length === 0 || values.length === 0) {
      return [];
    }

    const valuesByMetricId = new Map(
      values.map((v) => {
        return [v.habitMetricId, v.value as MetricValue];
      })
    );

    return definitions
      .filter((d) => {
        return valuesByMetricId.has(d.id);
      })
      .map((d) => {
        return {
          id: d.id,
          label: `${d.name}: ${formatMetricValue(d as HabitMetric, valuesByMetricId.get(d.id)!)}`,
        };
      });
  }, [occurrence.habit.metricDefinitions, occurrence.metricValues]);

  const occurrenceNote = React.useMemo(() => {
    return notes[occurrence.id];
  }, [notes, occurrence]);

  return (
    <li
      key={occurrence.id}
      className={cn(
        'border-neutral-500 py-2 not-last:border-b',
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
              <span
                className={cn(
                  'italic',
                  !occurrenceNote &&
                    occurrence.hasSpecificTime &&
                    'text-gray-400'
                )}
              >
                {occurrenceNote?.content || '(no note)'}
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
                return (
                  <Chip size="sm" key={chip.id} variant="flat" color="default">
                    {chip.label}
                  </Chip>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            onPress={onEdit}
            color="secondary"
            isDisabled={isBeingRemoved}
            aria-label="edit-habit-entry"
            className="h-6 w-6 min-w-0 rounded-lg"
          >
            <PencilSimpleIcon
              size={14}
              fill="bold"
              className="dark:fill-white"
            />
          </Button>
          <Button
            isIconOnly
            color="danger"
            variant="light"
            onPress={onRemove}
            isLoading={isBeingRemoved}
            aria-label="delete-habit-entry"
            className="h-6 w-6 min-w-0 rounded-lg"
            spinner={
              <Spinner
                size="sm"
                color="danger"
                className="size-3.5 [&>div]:size-3.5"
              />
            }
          >
            <TrashSimpleIcon
              size={14}
              fill="bold"
              className="dark:fill-white"
            />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default OccurrenceListItem;
