import { Input, Switch } from '@heroui/react';

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
      <Input
        size="sm"
        label="Unit"
        variant="faded"
        value={config.unit || ''}
        placeholder="e.g., km, kg, bpm"
        onChange={(e) => {
          onChange({ ...config, unit: e.target.value || undefined });
        }}
      />
      <div className="flex gap-2">
        <Input
          size="sm"
          label="Min"
          type="number"
          variant="faded"
          placeholder="Optional"
          value={config.min?.toString() || ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange({
              ...config,
              min: val ? Number(val) : undefined,
            });
          }}
        />
        <Input
          size="sm"
          label="Max"
          type="number"
          variant="faded"
          placeholder="Optional"
          value={config.max?.toString() || ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange({
              ...config,
              max: val ? Number(val) : undefined,
            });
          }}
        />
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
  const formats = ['hh:mm:ss', 'hh:mm', 'minutes', 'seconds'] as const;

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
      <Input
        size="sm"
        label="Min"
        type="number"
        variant="faded"
        value={config.min?.toString() || '1'}
        onChange={(e) => {
          onChange({ ...config, min: Number(e.target.value) || 1 });
        }}
      />
      <Input
        size="sm"
        label="Max"
        type="number"
        variant="faded"
        value={config.max?.toString() || '10'}
        onChange={(e) => {
          onChange({ ...config, max: Number(e.target.value) || 10 });
        }}
      />
      <Input
        size="sm"
        label="Step"
        type="number"
        variant="faded"
        value={config.step?.toString() || '1'}
        onChange={(e) => {
          onChange({ ...config, step: Number(e.target.value) || 1 });
        }}
      />
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
    <Input
      size="sm"
      label="Unit"
      variant="faded"
      value={config.unit || ''}
      placeholder="e.g., pages, reps"
      onChange={(e) => {
        onChange({ ...config, unit: e.target.value || undefined });
      }}
    />
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
            <Input
              size="sm"
              value={option}
              variant="faded"
              placeholder={`Option ${index + 1}`}
              onChange={(e) => {
                handleOptionChange(index, e.target.value);
              }}
            />
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
        onValueChange={(val) => {
          onChange({ ...config, allowMultiple: val });
        }}
      >
        <span className="text-xs">Allow multiple selections</span>
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
      <Input
        size="sm"
        variant="faded"
        placeholder="Yes"
        label="True label"
        value={config.trueLabel || ''}
        onChange={(e) => {
          onChange({ ...config, trueLabel: e.target.value || undefined });
        }}
      />
      <Input
        size="sm"
        variant="faded"
        placeholder="No"
        label="False label"
        value={config.falseLabel || ''}
        onChange={(e) => {
          onChange({ ...config, falseLabel: e.target.value || undefined });
        }}
      />
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
    <Input
      size="sm"
      type="number"
      variant="faded"
      label="Max length"
      placeholder="Optional"
      value={config.maxLength?.toString() || ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange({ ...config, maxLength: val ? Number(val) : undefined });
      }}
    />
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
