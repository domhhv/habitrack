import { Label, Switch } from '@heroui/react';

import { MetricValuesSection } from '@components';
import type { Habit, MetricValue } from '@models';

type MetricValuesState = Record<string, MetricValue | undefined>;

type StockMetricDefaultsProps = {
  compoundDefaults: Record<string, boolean>;
  metricDefaults: MetricValuesState;
  metricDefinitions: Habit['metricDefinitions'];
  onChange: (values: MetricValuesState) => void;
  onCompoundChange: (values: Record<string, boolean>) => void;
};

const StockMetricDefaults = ({
  compoundDefaults,
  metricDefaults,
  metricDefinitions,
  onChange,
  onCompoundChange,
}: StockMetricDefaultsProps) => {
  const numberMetricsWithDefaults = metricDefinitions.filter((metric) => {
    return metric.type === 'number' && metricDefaults[metric.id] !== undefined;
  });

  return (
    <div className="space-y-1">
      <p className="text-foreground-500 text-tiny font-medium">
        Default metric values
      </p>
      <p className="text-foreground-400 text-tiny">
        These will auto-populate when this stock is selected during logging.
      </p>
      <MetricValuesSection
        onChange={onChange}
        values={metricDefaults}
        metricDefinitions={metricDefinitions}
      />
      {numberMetricsWithDefaults.length > 0 && (
        <div className="space-y-2">
          <p className="text-foreground-400 text-tiny">
            Compound numeric defaults across selected stocks.
          </p>
          {numberMetricsWithDefaults.map((metric) => {
            return (
              <div key={metric.id} className="flex items-center gap-2">
                <Switch
                  size="sm"
                  isSelected={compoundDefaults[metric.id] ?? false}
                  onChange={(next: boolean) => {
                    onCompoundChange({
                      ...compoundDefaults,
                      [metric.id]: next,
                    });
                  }}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Content>
                    <Label>{metric.name}</Label>
                  </Switch.Content>
                </Switch>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockMetricDefaults;
