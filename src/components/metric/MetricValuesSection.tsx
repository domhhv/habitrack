import { Spinner } from '@heroui/react';
import React from 'react';

import type { MetricValue, MetricConfig, OccurrenceMetricValue } from '@models';
import {
  useHabitMetrics,
  useMetricsActions,
  useOccurrenceMetricValues,
} from '@stores';

import MetricValueInput from './MetricValueInput';

type MetricValuesState = Record<string, MetricValue | undefined>;

type MetricValuesSectionProps = {
  habitId: string | undefined;
  occurrenceId: string | undefined;
  values: MetricValuesState;
  onChange: (values: MetricValuesState) => void;
};

const MetricValuesSection = ({
  habitId,
  occurrenceId,
  onChange,
  values,
}: MetricValuesSectionProps) => {
  const metrics = useHabitMetrics(habitId);
  const { fetchHabitMetrics, fetchMetricValues } = useMetricsActions();
  const existingValues = useOccurrenceMetricValues(occurrenceId);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasInitializedExisting, setHasInitializedExisting] =
    React.useState(false);

  React.useEffect(() => {
    if (!habitId) {
      return;
    }

    setIsLoading(true);
    fetchHabitMetrics(habitId).finally(() => {
      setIsLoading(false);
    });
  }, [habitId, fetchHabitMetrics]);

  React.useEffect(() => {
    if (!occurrenceId) {
      return;
    }

    fetchMetricValues(occurrenceId);
  }, [occurrenceId, fetchMetricValues]);

  React.useEffect(() => {
    if (hasInitializedExisting || !occurrenceId) {
      return;
    }

    if (Object.keys(existingValues).length === 0) {
      return;
    }

    const initial: MetricValuesState = {};

    for (const [metricId, entry] of Object.entries(existingValues)) {
      initial[metricId] = (entry as OccurrenceMetricValue).value as MetricValue;
    }

    onChange(initial);
    setHasInitializedExisting(true);
  }, [existingValues, hasInitializedExisting, occurrenceId, onChange]);

  React.useEffect(() => {
    setHasInitializedExisting(false);
  }, [habitId]);

  if (!habitId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <Spinner size="sm" />
      </div>
    );
  }

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-foreground-500 text-tiny font-medium">Metrics</p>
      {metrics.map((metric) => {
        return (
          <MetricValueInput
            key={metric.id}
            name={metric.name}
            type={metric.type}
            value={values[metric.id]}
            config={metric.config as MetricConfig}
            onChange={(val) => {
              onChange({ ...values, [metric.id]: val });
            }}
          />
        );
      })}
    </div>
  );
};

export default MetricValuesSection;
