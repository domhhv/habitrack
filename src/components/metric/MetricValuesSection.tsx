import type { Habit, MetricValue, MetricConfig } from '@models';

import MetricValueInput from './MetricValueInput';

type MetricValuesState = Record<string, MetricValue | undefined>;

type MetricValuesSectionProps = {
  metricDefinitions: Habit['metricDefinitions'];
  previousValues?: MetricValuesState;
  values: MetricValuesState;
  onChange: (values: MetricValuesState) => void;
};

const MetricValuesSection = ({
  metricDefinitions,
  onChange,
  previousValues,
  values,
}: MetricValuesSectionProps) => {
  if (metricDefinitions.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-foreground-500 text-tiny font-medium">Metrics</p>
      {metricDefinitions.map((metric) => {
        return (
          <MetricValueInput
            key={metric.id}
            name={metric.name}
            type={metric.type}
            value={values[metric.id]}
            config={metric.config as MetricConfig}
            previousValue={previousValues?.[metric.id]}
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
