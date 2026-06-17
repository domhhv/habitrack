import {
  Chip,
  Form,
  Input,
  Label,
  Header,
  Select,
  Switch,
  ListBox,
  useFilter,
  TextField,
  EmptyState,
  FieldError,
  SearchField,
  Autocomplete,
} from '@heroui/react';
import {
  TrashIcon,
  StackPlusIcon,
  TrashSimpleIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import React from 'react';

import { CustomButton } from '@components';
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
  const { contains } = useFilter({ sensitivity: 'base' });

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const submitMetric = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onChange({
      isBeingEdited: false,
      ...(metric.isPersisted ? { isToBeUpdated: true } : { isToBeAdded: true }),
    });
  };

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
          <CustomButton
            isIconOnly
            aria-label="Edit metric"
            onPress={() => {
              onChange({ isBeingEdited: true });
            }}
          >
            <PencilSimpleIcon />
          </CustomButton>
          <CustomButton
            isIconOnly
            onPress={onRemove}
            aria-label="Remove metric"
          >
            <TrashSimpleIcon />
          </CustomButton>
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

      <Form onSubmit={submitMetric} className="flex flex-col gap-3 pb-2">
        <Autocomplete
          variant="secondary"
          placeholder="Select a preset"
          value={metric.presetName ?? null}
          onClear={() => {
            onChange({
              config: {},
              isRequired: false,
              name: '',
              presetName: undefined,
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
          <Label>Preset</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField autoFocus name="search" variant="secondary">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search for units, e.g. kilometers, kcal..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                renderEmptyState={() => {
                  return <EmptyState>No results found</EmptyState>;
                }}
              >
                {METRIC_PRESETS.map(({ group, presets }) => {
                  return (
                    <ListBox.Section key={group}>
                      <Header>{group}</Header>
                      {presets.map((preset) => {
                        return (
                          <ListBox.Item
                            id={preset.name}
                            key={preset.name}
                            textValue={preset.name}
                          >
                            {preset.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox.Section>
                  );
                })}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>
        <TextField
          fullWidth
          name="name"
          variant="secondary"
          value={metric.name}
          onChange={(value) => {
            onChange({
              name: value,
            });
          }}
        >
          <Label>Metric name</Label>
          <Input required placeholder="Metric name" />
          <FieldError />
        </TextField>
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

        <CustomButton
          fullWidth
          onPress={onRemove}
          variant="danger-soft"
          className="text-danger"
        >
          <TrashIcon size={14} />
          {metric.isToBeAdded ? 'Remove' : 'Discard'}
        </CustomButton>

        <CustomButton fullWidth type="submit" variant="secondary">
          <StackPlusIcon size={14} />
          Done
        </CustomButton>
      </Form>
    </div>
  );
};

export default MetricDefinitionForm;
