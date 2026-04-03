import {
  Chip,
  Input,
  Label,
  Button,
  Header,
  Select,
  Switch,
  ListBox,
  ListBoxItem,
  Autocomplete,
  ListBoxSection,
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
      <div className="flex items-center justify-between gap-16">
        <div>
          <div className="flex items-center gap-2">
            <h3>{metric.name}</h3>
            {!metric.isPersisted && metric.isToBeAdded && (
              <Chip size="sm" color="success">
                New
              </Chip>
            )}
            {metric.isToBeUpdated && (
              <Chip size="sm" color="default">
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
          variant="secondary"
          value={metric.presetName ?? null}
          onClear={() => {
            onChange({
              config: {},
              isRequired: false,
              name: '',
              type: 'number',
            });
          }}
          onChange={(key) => {
            const preset = ALL_PRESETS.find((p) => {
              return p.name === key;
            });

            if (!preset) {
              return;
            }

            onChange({
              ...preset,
              name: preset.name.split(' (')[0],
              presetName: preset.name,
            });
          }}
        >
          <Autocomplete.Trigger>
            <Autocomplete.Filter>
              <Input placeholder="Search for units, e.g. kilometers, kcal..." />
            </Autocomplete.Filter>
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <ListBox>
              {METRIC_PRESETS.map(({ group, presets }) => {
                return (
                  <ListBoxSection key={group}>
                    <Header>{group}</Header>
                    {presets.map((preset) => {
                      return (
                        <ListBoxItem id={preset.name} key={preset.name}>
                          {preset.name}
                        </ListBoxItem>
                      );
                    })}
                  </ListBoxSection>
                );
              })}
            </ListBox>
          </Autocomplete.Popover>
        </Autocomplete>
        <Input
          value={metric.name}
          variant="secondary"
          placeholder="Metric name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onChange({
              name: e.target.value,
            });
          }}
        />
        <Select
          variant="secondary"
          value={metric.type}
          onChange={(key) => {
            const value = key as MetricType;

            onChange({
              config: DEFAULT_CONFIGS[value],
              type: value,
            });
          }}
        >
          <Label>Metric type</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {(
                Object.entries(METRIC_TYPE_LABELS) as [MetricType, string][]
              ).map(([value, label]) => {
                return (
                  <ListBox.Item id={value} key={value} textValue={label}>
                    <Label>{label}</Label>
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
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
          onChange={(val: boolean) => {
            onChange({ isRequired: val });
          }}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-xs">Required</Label>
          </Switch.Content>
        </Switch>

        <Button
          size="sm"
          variant="ghost"
          onPress={onRemove}
          className="text-danger"
        >
          <TrashIcon size={14} />
          {metric.isToBeAdded ? 'Remove' : 'Discard'}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            onChange({
              isBeingEdited: false,
              ...(metric.isPersisted
                ? { isToBeUpdated: true }
                : { isToBeAdded: true }),
            });
          }}
        >
          <StackPlusIcon size={14} />
          Done
        </Button>
      </div>
    </div>
  );
};

export default MetricDefinitionForm;
