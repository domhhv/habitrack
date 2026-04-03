import { Input, Label, Switch, TextField } from '@heroui/react';

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
        <TextField
          type="number"
          variant="secondary"
          value={config.min?.toString() || ''}
          onChange={(value) => {
            const val = value;
            onChange({
              ...config,
              min: val ? Number(val) : undefined,
            });
          }}
        >
          <Label>Min</Label>
          <Input placeholder="Optional" />
        </TextField>
        <TextField
          type="number"
          variant="secondary"
          value={config.max?.toString() || ''}
          onChange={(value) => {
            const val = value;
            onChange({
              ...config,
              max: val ? Number(val) : undefined,
            });
          }}
        >
          <Label>Max</Label>
          <Input placeholder="Optional" />
        </TextField>
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
          <button
            key={format}
            type="button"
            onClick={() => {
              onChange({ ...config, format });
            }}
            className={`rounded-md px-3 py-1.5 text-xs ${
              config.format === format
                ? 'bg-primary text-primary-foreground'
                : 'bg-default-100'
            }`}
          >
            {format}
          </button>
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
    <div className="flex flex-col gap-2">
      {options.map((option, index) => {
        return (
          <div key={index} className="flex items-center gap-2">
            <TextField
              value={option}
              variant="secondary"
              onChange={(value) => {
                handleOptionChange(index, value);
              }}
            >
              <Input placeholder={`Option ${index + 1}`} />
            </TextField>
            <button
              type="button"
              className="text-danger text-sm"
              onClick={() => {
                handleRemoveOption(index);
              }}
            >
              &times;
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={handleAddOption}
        className="text-primary self-start text-xs"
      >
        + Add option
      </button>
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
      return (
        <NumberConfigFields
          onChange={onChange}
          config={config as NumberMetricConfig}
        />
      );

    case 'duration':
      return (
        <DurationConfigFields
          onChange={onChange}
          config={config as DurationMetricConfig}
        />
      );

    case 'scale':
      return (
        <ScaleConfigFields
          onChange={onChange}
          config={config as ScaleMetricConfig}
        />
      );

    case 'range':
      return (
        <RangeConfigFields
          onChange={onChange}
          config={config as RangeMetricConfig}
        />
      );

    case 'choice':
      return (
        <ChoiceConfigFields
          onChange={onChange}
          config={config as ChoiceMetricConfig}
        />
      );

    case 'boolean':
      return (
        <BooleanConfigFields
          onChange={onChange}
          config={config as BooleanMetricConfig}
        />
      );

    case 'text':
      return (
        <TextConfigFields
          onChange={onChange}
          config={config as TextMetricConfig}
        />
      );

    case 'percentage':
      return null;

    default:
      return null;
  }
};

export default MetricConfigFields;
