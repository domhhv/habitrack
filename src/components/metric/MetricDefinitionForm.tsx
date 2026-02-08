import {
  Chip,
  Input,
  Button,
  Select,
  Switch,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from '@heroui/react';
import {
  TrashIcon,
  StackPlusIcon,
  TrashSimpleIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import React from 'react';

import { METRIC_PRESETS } from '@const';
import type { MetricType, MetricConfig, FormMetricDefinitions } from '@models';

import MetricConfigFields from './MetricConfigFields';

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

const ALL_PRESETS = METRIC_PRESETS.flatMap((m) => {
  return m.presets;
});

type MetricDefinitionFormProps = {
  metric: FormMetricDefinitions;
  onChange: (metric: Partial<FormMetricDefinitions>) => void;
  onRemove: () => void;
};

const MetricDefinitionForm = ({
  metric,
  onChange,
  onRemove,
}: MetricDefinitionFormProps) => {
  if (!metric.isBeingEdited) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3>{metric.name}</h3>
            {!metric.isPersisted && metric.isToBeAdded && (
              <Chip size="sm" color="success">
                New
              </Chip>
            )}
            {metric.isToBeUpdated && (
              <Chip size="sm" color="secondary">
                To be updated
              </Chip>
            )}
            {metric.isToBeRemoved && (
              <Chip size="sm" color="danger">
                To be removed
              </Chip>
            )}
          </div>
          <p>{metric.type}</p>
        </div>
        <div className="space-x-2">
          <Button
            isIconOnly
            onPress={() => {
              onChange({ isBeingEdited: true });
            }}
          >
            <PencilSimpleIcon />
          </Button>
          <Button isIconOnly onPress={onRemove}>
            <TrashSimpleIcon />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">
          {metric.isPersisted ? 'Edit metric' : 'New metric'}
        </p>
        <p className="text-default-400 dark:text-default-600 text-xs">
          Add a metric to track measurements for this habit.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-2">
        <Autocomplete
          size="sm"
          variant="faded"
          value={metric.name}
          label="Choose from presets (optional)"
          placeholder="Search for units, e.g. kilometers, kcal..."
          onClear={() => {
            onChange({
              config: {},
              isRequired: false,
              type: 'number',
            });
          }}
          onSelectionChange={(key) => {
            const preset = ALL_PRESETS.find((p) => {
              return p.name === key;
            });

            if (!preset) {
              return;
            }

            onChange({ ...preset, name: preset.name.split(' (')[0] });
          }}
        >
          {METRIC_PRESETS.map(({ group, presets }) => {
            return (
              <AutocompleteSection key={group} title={group}>
                {presets.map((preset) => {
                  return (
                    <AutocompleteItem key={preset.name}>
                      {preset.name}
                    </AutocompleteItem>
                  );
                })}
              </AutocompleteSection>
            );
          })}
        </Autocomplete>
        <Input
          size="sm"
          variant="faded"
          label="Metric name"
          value={metric.name}
          onValueChange={(name) => {
            onChange({
              name,
            });
          }}
        />
        <Select
          size="sm"
          variant="faded"
          label="Metric type"
          selectedKeys={[metric.type]}
        >
          {(Object.entries(METRIC_TYPE_LABELS) as [MetricType, string][]).map(
            ([value, label]) => {
              return (
                <SelectItem
                  key={value}
                  textValue={label}
                  onPress={() => {
                    onChange({
                      config: DEFAULT_CONFIGS[value],
                      type: value,
                    });
                  }}
                >
                  {label}
                </SelectItem>
              );
            }
          )}
        </Select>

        <MetricConfigFields
          type={metric.type}
          config={metric.config}
          onChange={(config) => {
            if ('format' in config) {
              const durationPreset = METRIC_PRESETS.find((mp) => {
                return mp.group === 'Duration';
              })?.presets.find((p) => {
                return (
                  'format' in p.config && p.config.format === config.format
                );
              });

              if (durationPreset) {
                return onChange({
                  config,
                  name: durationPreset.name,
                });
              }
            }

            onChange({ config });
          }}
        />

        <Switch
          size="sm"
          isSelected={metric.isRequired}
          onValueChange={(val) => {
            onChange({ isRequired: val });
          }}
        >
          <span className="text-xs">Required</span>
        </Switch>

        <Button
          size="sm"
          color="danger"
          variant="light"
          onPress={onRemove}
          startContent={<TrashIcon size={14} />}
        >
          {metric.isToBeAdded ? 'Remove' : 'Discard'}
        </Button>

        <Button
          size="sm"
          variant="flat"
          color="success"
          startContent={<StackPlusIcon size={14} />}
          onPress={() => {
            onChange({ isBeingEdited: false, isToBeAdded: true });
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default MetricDefinitionForm;
