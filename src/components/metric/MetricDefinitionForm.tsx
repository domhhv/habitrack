import {
  Input,
  Button,
  Select,
  Switch,
  Divider,
  Accordion,
  SelectItem,
  AccordionItem,
} from '@heroui/react';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';

import type { MetricType, MetricConfig, MetricPreset } from '@models';

import MetricConfigFields from './MetricConfigFields';
import MetricPresetChips from './MetricPresetChips';

export type LocalMetricDefinition = {
  config: MetricConfig;
  id: string;
  isRequired: boolean;
  name: string;
  sortOrder: number;
  type: MetricType;
};

const METRIC_TYPE_LABELS: Record<MetricType, string> = {
  boolean: 'Yes/No',
  choice: 'Choice',
  duration: 'Duration',
  number: 'Number',
  percentage: 'Percentage',
  range: 'Range',
  scale: 'Scale',
  text: 'Text',
};

const DEFAULT_CONFIGS: Record<MetricType, MetricConfig> = {
  boolean: {},
  choice: { options: [''] },
  duration: { format: 'hh:mm' },
  number: {},
  percentage: {},
  range: {},
  scale: { max: 10, min: 1, step: 1 },
  text: {},
};

let nextLocalId = 0;

const generateLocalId = () => {
  nextLocalId += 1;

  return `local-${nextLocalId}-${Date.now()}`;
};

type MetricDefinitionFormProps = {
  metrics: LocalMetricDefinition[];
  onChange: (metrics: LocalMetricDefinition[]) => void;
};

const MetricDefinitionForm = ({
  metrics,
  onChange,
}: MetricDefinitionFormProps) => {
  const handleAddCustom = () => {
    const newMetric: LocalMetricDefinition = {
      config: {},
      id: generateLocalId(),
      isRequired: false,
      name: '',
      sortOrder: metrics.length,
      type: 'number',
    };

    onChange([...metrics, newMetric]);
  };

  const handleAddPreset = (preset: MetricPreset) => {
    const newMetric: LocalMetricDefinition = {
      config: preset.config,
      id: generateLocalId(),
      isRequired: false,
      name: preset.name,
      sortOrder: metrics.length,
      type: preset.type,
    };

    onChange([...metrics, newMetric]);
  };

  const handleRemove = (id: string) => {
    onChange(
      metrics
        .filter((m) => {
          return m.id !== id;
        })
        .map((m, i) => {
          return { ...m, sortOrder: i };
        })
    );
  };

  const handleUpdate = (
    id: string,
    updates: Partial<LocalMetricDefinition>
  ) => {
    onChange(
      metrics.map((m) => {
        return m.id === id ? { ...m, ...updates } : m;
      })
    );
  };

  const handleTypeChange = (id: string, newType: MetricType) => {
    handleUpdate(id, {
      config: DEFAULT_CONFIGS[newType],
      type: newType,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Divider />
      <p className="text-sm font-medium">Metrics</p>
      <p className="text-default-400 text-xs">
        Add metrics to track measurements for this habit.
      </p>

      <MetricPresetChips onSelect={handleAddPreset} />

      {metrics.length > 0 && (
        <Accordion variant="shadow" selectionMode="multiple">
          {metrics.map((metric) => {
            return (
              <AccordionItem
                key={metric.id}
                title={
                  <span className="text-sm">
                    {metric.name || 'Unnamed metric'}
                  </span>
                }
                subtitle={
                  <span className="text-default-400 text-xs">
                    {METRIC_TYPE_LABELS[metric.type]}
                  </span>
                }
              >
                <div className="flex flex-col gap-3 pb-2">
                  <Input
                    size="sm"
                    variant="faded"
                    label="Metric name"
                    value={metric.name}
                    placeholder="e.g., Distance, Weight"
                    onChange={(e) => {
                      handleUpdate(metric.id, { name: e.target.value });
                    }}
                  />
                  <Select
                    size="sm"
                    label="Type"
                    variant="faded"
                    selectedKeys={[metric.type]}
                    data-testid="metric-type-select"
                  >
                    {(
                      Object.entries(METRIC_TYPE_LABELS) as [
                        MetricType,
                        string,
                      ][]
                    ).map(([value, label]) => {
                      return (
                        <SelectItem
                          key={value}
                          textValue={label}
                          onPress={() => {
                            handleTypeChange(metric.id, value);
                          }}
                        >
                          {label}
                        </SelectItem>
                      );
                    })}
                  </Select>

                  <MetricConfigFields
                    type={metric.type}
                    config={metric.config}
                    onChange={(config) => {
                      handleUpdate(metric.id, { config });
                    }}
                  />

                  <Switch
                    size="sm"
                    isSelected={metric.isRequired}
                    onValueChange={(val) => {
                      handleUpdate(metric.id, { isRequired: val });
                    }}
                  >
                    <span className="text-xs">Required</span>
                  </Switch>

                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    startContent={<TrashIcon size={14} />}
                    onPress={() => {
                      handleRemove(metric.id);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <Button
        size="sm"
        variant="flat"
        onPress={handleAddCustom}
        startContent={<PlusIcon size={14} />}
      >
        Add custom metric
      </Button>
    </div>
  );
};

export default MetricDefinitionForm;
