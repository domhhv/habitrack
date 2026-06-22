import { Input, Label, Switch, TextField, NumberField } from '@heroui/react';
import {
  XIcon,
  PlusIcon,
  CaretUpIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';

import { CustomButton } from '@components';
import type {
  MetricType,
  MetricConfig,
  TextMetricConfig,
  RangeMetricConfig,
  ScaleMetricConfig,
  ChoiceMetricConfig,
  NumberMetricConfig,
  BooleanMetricConfig,
  DurationMetricConfig,
} from '@models';
import { isMetricConfigForType } from '@utils';

type MetricConfigFieldsProps = {
  config: MetricConfig;
  type: MetricType;
  onChange: (config: MetricConfig) => void;
};

const NumberConfigFields = ({
  config,
  onChange,
}: {
  config: NumberMetricConfig;
  onChange: (config: NumberMetricConfig) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <TextField
        variant="secondary"
        value={config.unit || ''}
        onChange={(value) => {
          onChange({ ...config, unit: value || undefined });
        }}
      >
        <Label>Unit</Label>
        <Input placeholder="e.g., km, kg, bpm" />
      </TextField>
      <div className="flex gap-2">
        <NumberField
          name="min"
          className="w-full"
          variant="secondary"
          value={config.min ?? undefined}
          onChange={(value) => {
            const val = value;
            onChange({
              ...config,
              min: val ? Number(val) : undefined,
            });
          }}
        >
          <Label>Minimum value</Label>
          <NumberField.Group className="flex">
            <NumberField.Input className="flex-1" placeholder="Optional" />
            <div className="border-border flex h-full flex-col border-l">
              <NumberField.IncrementButton className="flex h-1/2 w-6 items-center justify-center rounded-none border-0 pt-0.5 text-sm">
                <CaretUpIcon />
              </NumberField.IncrementButton>
              <NumberField.DecrementButton className="flex h-1/2 w-6 items-center justify-center rounded-none border-0 pb-0.5 text-sm">
                <CaretDownIcon />
              </NumberField.DecrementButton>
            </div>
          </NumberField.Group>
        </NumberField>
        <NumberField
          name="max"
          className="w-full"
          variant="secondary"
          value={config.max ?? undefined}
          onChange={(value) => {
            const val = value;
            onChange({
              ...config,
              max: val ? Number(val) : undefined,
            });
          }}
        >
          <Label>Maximum value</Label>
          <NumberField.Group className="flex">
            <NumberField.Input className="flex-1" placeholder="Optional" />
            <div className="border-border flex h-full flex-col border-l">
              <NumberField.IncrementButton className="flex h-1/2 w-6 items-center justify-center rounded-none border-0 pt-0.5 text-sm">
                <CaretUpIcon />
              </NumberField.IncrementButton>
              <NumberField.DecrementButton className="flex h-1/2 w-6 items-center justify-center rounded-none border-0 pb-0.5 text-sm">
                <CaretDownIcon />
              </NumberField.DecrementButton>
            </div>
          </NumberField.Group>
        </NumberField>
      </div>
    </div>
  );
};

const DurationConfigFields = ({
  config,
  onChange,
}: {
  config: DurationMetricConfig;
  onChange: (config: DurationMetricConfig) => void;
}) => {
  const formats = [
    'hh:mm:ss',
    'hh:mm',
    'mm:ss',
    'hours',
    'minutes',
    'seconds',
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((format) => {
        return (
          <CustomButton
            key={format}
            variant={config.format === format ? 'primary' : 'secondary'}
            onClick={() => {
              onChange({ ...config, format });
            }}
          >
            {format}
          </CustomButton>
        );
      })}
    </div>
  );
};

const ScaleConfigFields = ({
  config,
  onChange,
}: {
  config: ScaleMetricConfig;
  onChange: (config: ScaleMetricConfig) => void;
}) => {
  return (
    <div className="flex gap-2">
      <TextField
        type="number"
        variant="secondary"
        value={config.min?.toString() || '1'}
        onChange={(value) => {
          onChange({ ...config, min: Number(value) || 1 });
        }}
      >
        <Label>Min</Label>
        <Input />
      </TextField>
      <TextField
        type="number"
        variant="secondary"
        value={config.max?.toString() || '10'}
        onChange={(value) => {
          onChange({ ...config, max: Number(value) || 10 });
        }}
      >
        <Label>Max</Label>
        <Input />
      </TextField>
      <TextField
        type="number"
        variant="secondary"
        value={config.step?.toString() || '1'}
        onChange={(value) => {
          onChange({ ...config, step: Number(value) || 1 });
        }}
      >
        <Label>Step</Label>
        <Input />
      </TextField>
    </div>
  );
};

const RangeConfigFields = ({
  config,
  onChange,
}: {
  config: RangeMetricConfig;
  onChange: (config: RangeMetricConfig) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <TextField
        variant="secondary"
        value={config.unit || ''}
        onChange={(value) => {
          onChange({ ...config, unit: value || undefined });
        }}
      >
        <Label>Unit</Label>
        <Input placeholder="e.g., pages, reps" />
      </TextField>
      <Switch
        size="sm"
        isSelected={config.continueFromLast || false}
        onChange={(val: boolean) => {
          onChange({ ...config, continueFromLast: val });
        }}
      >
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-xs">Continue from last value</Label>
        </Switch.Content>
      </Switch>
      {config.continueFromLast && (
        <p className="text-foreground-500 text-xs">
          When logging, range values will start from where you left off in the
          previous entry
        </p>
      )}
    </div>
  );
};

const ChoiceConfigFields = ({
  config,
  onChange,
}: {
  config: ChoiceMetricConfig;
  onChange: (config: ChoiceMetricConfig) => void;
}) => {
  const options = config.options || [];

  const handleAddOption = () => {
    onChange({ ...config, options: [...options, ''] });
  };

  const handleRemoveOption = (index: number) => {
    onChange({
      ...config,
      options: options.filter((_, i) => {
        return i !== index;
      }),
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    onChange({ ...config, options: updated });
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        return (
          <div key={index} className="flex w-full items-center gap-2">
            <TextField
              value={option}
              className="flex-1"
              variant="secondary"
              onChange={(value) => {
                handleOptionChange(index, value);
              }}
            >
              <Input placeholder={`Option ${index + 1}`} />
            </TextField>
            <CustomButton
              variant="danger-soft"
              aria-label={`Remove option ${index + 1}`}
              onClick={() => {
                handleRemoveOption(index);
              }}
            >
              <XIcon size={16} weight="bold" />
            </CustomButton>
          </div>
        );
      })}
      <CustomButton fullWidth variant="secondary" onClick={handleAddOption}>
        <PlusIcon />
        Add option
      </CustomButton>
      <Switch
        size="sm"
        isSelected={config.allowMultiple || false}
        onChange={(val: boolean) => {
          onChange({ ...config, allowMultiple: val });
        }}
      >
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-xs">Allow multiple selections</Label>
        </Switch.Content>
      </Switch>
    </div>
  );
};

const BooleanConfigFields = ({
  config,
  onChange,
}: {
  config: BooleanMetricConfig;
  onChange: (config: BooleanMetricConfig) => void;
}) => {
  return (
    <div className="flex gap-2">
      <TextField
        variant="secondary"
        value={config.trueLabel || ''}
        onChange={(value) => {
          onChange({ ...config, trueLabel: value || undefined });
        }}
      >
        <Label>True label</Label>
        <Input placeholder="Yes" />
      </TextField>
      <TextField
        variant="secondary"
        value={config.falseLabel || ''}
        onChange={(value) => {
          onChange({ ...config, falseLabel: value || undefined });
        }}
      >
        <Label>False label</Label>
        <Input placeholder="No" />
      </TextField>
    </div>
  );
};

const TextConfigFields = ({
  config,
  onChange,
}: {
  config: TextMetricConfig;
  onChange: (config: TextMetricConfig) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <TextField
        type="number"
        variant="secondary"
        value={config.maxLength?.toString() || ''}
        onChange={(value) => {
          const val = value;
          onChange({ ...config, maxLength: val ? Number(val) : undefined });
        }}
      >
        <Label>Max length</Label>
        <Input placeholder="Optional" />
      </TextField>
      <Switch
        size="sm"
        isSelected={config.multiline || false}
        onChange={(val: boolean) => {
          onChange({ ...config, multiline: val });
        }}
      >
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-xs">Allow multiline</Label>
        </Switch.Content>
      </Switch>
    </div>
  );
};

const MetricConfigFields = ({
  config,
  onChange,
  type,
}: MetricConfigFieldsProps) => {
  switch (type) {
    case 'number':
      return isMetricConfigForType(type, config) ? (
        <NumberConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'duration':
      return isMetricConfigForType(type, config) ? (
        <DurationConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'scale':
      return isMetricConfigForType(type, config) ? (
        <ScaleConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'range':
      return isMetricConfigForType(type, config) ? (
        <RangeConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'choice':
      return isMetricConfigForType(type, config) ? (
        <ChoiceConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'boolean':
      return isMetricConfigForType(type, config) ? (
        <BooleanConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'text':
      return isMetricConfigForType(type, config) ? (
        <TextConfigFields config={config} onChange={onChange} />
      ) : null;

    case 'percentage':
      return null;

    default:
      return null;
  }
};

export default MetricConfigFields;
