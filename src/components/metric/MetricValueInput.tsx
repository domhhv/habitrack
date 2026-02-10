import { Chip, Slider, Switch, Textarea, NumberInput } from '@heroui/react';

import type {
  MetricType,
  MetricValue,
  MetricConfig,
  TextMetricValue,
  TextMetricConfig,
  RangeMetricValue,
  RangeMetricConfig,
  ScaleMetricConfig,
  ChoiceMetricConfig,
  NumberMetricConfig,
  NumericMetricValue,
  BooleanMetricValue,
  BooleanMetricConfig,
  DurationMetricValue,
  DurationMetricConfig,
  MultiChoiceMetricValue,
  SingleChoiceMetricValue,
} from '@models';

type MetricValueInputProps = {
  config: MetricConfig;
  name: string;
  previousValue?: MetricValue;
  type: MetricType;
  value: MetricValue | undefined;
  onChange: (value: MetricValue | undefined) => void;
};

const NumberValueInput = ({
  config,
  name,
  onChange,
  value,
}: {
  config: NumberMetricConfig;
  name: string;
  value: NumericMetricValue | undefined;
  onChange: (value: NumericMetricValue | undefined) => void;
}) => {
  const label = config.unit ? `${name} (${config.unit})` : name;

  return (
    <NumberInput
      size="sm"
      label={label}
      variant="faded"
      minValue={config.min}
      maxValue={config.max}
      value={value?.numericValue ?? 0}
      formatOptions={
        config.decimalPlaces != null
          ? { maximumFractionDigits: config.decimalPlaces }
          : undefined
      }
      onValueChange={(v) => {
        if (isNaN(v)) {
          onChange(undefined);

          return;
        }

        onChange({ numericValue: v });
      }}
    />
  );
};

const PercentageValueInput = ({
  name,
  onChange,
  value,
}: {
  name: string;
  value: NumericMetricValue | undefined;
  onChange: (value: NumericMetricValue | undefined) => void;
}) => {
  return (
    <Slider
      step={1}
      size="sm"
      minValue={0}
      label={name}
      maxValue={100}
      value={value?.numericValue ?? 50}
      getValue={(v) => {
        return `${v}%`;
      }}
      onChange={(v) => {
        const numVal = typeof v === 'number' ? v : v[0];
        onChange({ numericValue: numVal });
      }}
    />
  );
};

const DurationValueInput = ({
  config,
  name,
  onChange,
  value,
}: {
  config: DurationMetricConfig;
  name: string;
  value: DurationMetricValue | undefined;
  onChange: (value: DurationMetricValue | undefined) => void;
}) => {
  const format = config.format || 'hh:mm';
  const ms = value?.durationMs ?? 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const handleChange = (h: number, m: number, s: number) => {
    onChange({ durationMs: (h * 3600 + m * 60 + s) * 1000 });
  };

  if (format === 'minutes') {
    return (
      <NumberInput
        size="sm"
        minValue={0}
        variant="faded"
        label={`${name} (min)`}
        value={Math.floor(ms / 60000)}
        onValueChange={(v) => {
          if (isNaN(v)) {
            onChange(undefined);

            return;
          }

          onChange({ durationMs: v * 60000 });
        }}
      />
    );
  }

  if (format === 'seconds') {
    return (
      <NumberInput
        size="sm"
        minValue={0}
        variant="faded"
        value={totalSeconds}
        label={`${name} (sec)`}
        onValueChange={(v) => {
          if (isNaN(v)) {
            onChange(undefined);

            return;
          }

          onChange({ durationMs: v * 1000 });
        }}
      />
    );
  }

  return (
    <div className="flex gap-2">
      <NumberInput
        size="sm"
        minValue={0}
        label="Hours"
        value={hours}
        variant="faded"
        onValueChange={(v) => {
          handleChange(isNaN(v) ? 0 : v, minutes, seconds);
        }}
      />
      <NumberInput
        size="sm"
        label="Min"
        minValue={0}
        maxValue={59}
        value={minutes}
        variant="faded"
        onValueChange={(v) => {
          handleChange(hours, isNaN(v) ? 0 : v, seconds);
        }}
      />
      {format === 'hh:mm:ss' && (
        <NumberInput
          size="sm"
          label="Sec"
          minValue={0}
          maxValue={59}
          value={seconds}
          variant="faded"
          onValueChange={(v) => {
            handleChange(hours, minutes, isNaN(v) ? 0 : v);
          }}
        />
      )}
    </div>
  );
};

const ScaleValueInput = ({
  config,
  name,
  onChange,
  value,
}: {
  config: ScaleMetricConfig;
  name: string;
  value: NumericMetricValue | undefined;
  onChange: (value: NumericMetricValue | undefined) => void;
}) => {
  const currentVal = value?.numericValue ?? config.min;

  const label = config.labels?.[String(currentVal)]
    ? `${name} - ${config.labels[String(currentVal)]}`
    : name;

  return (
    <Slider
      size="sm"
      label={label}
      step={config.step}
      value={currentVal}
      minValue={config.min}
      maxValue={config.max}
      onChange={(v) => {
        const numVal = typeof v === 'number' ? v : v[0];
        onChange({ numericValue: numVal });
      }}
    />
  );
};

const RangeValueInput = ({
  config,
  name,
  onChange,
  previousValue,
  value,
}: {
  config: RangeMetricConfig;
  name: string;
  previousValue?: RangeMetricValue;
  value: RangeMetricValue | undefined;
  onChange: (value: RangeMetricValue | undefined) => void;
}) => {
  const getDefaultValue = () => {
    if (value !== undefined) {
      return value;
    }

    if (
      config.continueFromLast &&
      previousValue &&
      'rangeTo' in previousValue
    ) {
      const nextValue = previousValue.rangeTo + 1;

      return { rangeFrom: nextValue, rangeTo: nextValue };
    }

    return { rangeFrom: 0, rangeTo: 0 };
  };

  const defaultValue = getDefaultValue();

  return (
    <div>
      <p className="mb-2 text-sm">{name}</p>
      <div className="flex gap-2">
        <NumberInput
          size="sm"
          variant="faded"
          minValue={config.min}
          maxValue={config.max}
          labelPlacement="outside"
          description={config.unit && `${config.unit} from`}
          value={value?.rangeFrom ?? defaultValue.rangeFrom}
          onValueChange={(v) => {
            onChange({
              rangeFrom: isNaN(v) ? 0 : v,
              rangeTo: value?.rangeTo ?? defaultValue.rangeTo,
            });
          }}
        />
        <NumberInput
          size="sm"
          variant="faded"
          minValue={config.min}
          maxValue={config.max}
          labelPlacement="outside"
          value={value?.rangeTo ?? defaultValue.rangeTo}
          description={config.unit && `${config.unit} to`}
          onValueChange={(v) => {
            onChange({
              rangeFrom: value?.rangeFrom ?? defaultValue.rangeFrom,
              rangeTo: isNaN(v) ? 0 : v,
            });
          }}
        />
      </div>
    </div>
  );
};

const ChoiceValueInput = ({
  config,
  name,
  onChange,
  value,
}: {
  config: ChoiceMetricConfig;
  name: string;
  value: SingleChoiceMetricValue | MultiChoiceMetricValue | undefined;
  onChange: (
    value: SingleChoiceMetricValue | MultiChoiceMetricValue | undefined
  ) => void;
}) => {
  const selectedOptions = value
    ? 'selectedOptions' in value
      ? value.selectedOptions
      : [value.selectedOption]
    : [];

  const handleToggle = (option: string) => {
    if (config.allowMultiple) {
      const updated = selectedOptions.includes(option)
        ? selectedOptions.filter((o) => {
            return o !== option;
          })
        : [...selectedOptions, option];

      onChange(updated.length > 0 ? { selectedOptions: updated } : undefined);
    } else {
      onChange(
        selectedOptions[0] === option ? undefined : { selectedOption: option }
      );
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-foreground-500 text-tiny">{name}</p>
      <div className="flex flex-wrap gap-1.5">
        {config.options.map((option) => {
          const isSelected = selectedOptions.includes(option);

          return (
            <Chip
              key={option}
              className="cursor-pointer"
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'solid' : 'bordered'}
              onClick={() => {
                handleToggle(option);
              }}
            >
              {option}
            </Chip>
          );
        })}
      </div>
    </div>
  );
};

const BooleanValueInput = ({
  config,
  name,
  onChange,
  value,
}: {
  config: BooleanMetricConfig;
  name: string;
  value: BooleanMetricValue | undefined;
  onChange: (value: BooleanMetricValue) => void;
}) => {
  const trueLabel = config.trueLabel || 'Yes';
  const falseLabel = config.falseLabel || 'No';

  return (
    <Switch
      size="sm"
      isSelected={value?.booleanValue ?? false}
      onValueChange={(v) => {
        onChange({ booleanValue: v });
      }}
    >
      <span className="text-sm">
        {name}: {value?.booleanValue ? trueLabel : falseLabel}
      </span>
    </Switch>
  );
};

const TextValueInput = ({
  config,
  name,
  onChange,
  value,
}: {
  config: TextMetricConfig;
  name: string;
  value: TextMetricValue | undefined;
  onChange: (value: TextMetricValue | undefined) => void;
}) => {
  return (
    <Textarea
      size="sm"
      label={name}
      variant="faded"
      maxLength={config.maxLength}
      value={value?.textValue ?? ''}
      placeholder={config.placeholder || ''}
      onChange={(e) => {
        const text = e.target.value;
        onChange(text ? { textValue: text } : undefined);
      }}
    />
  );
};

const MetricValueInput = ({
  config,
  name,
  onChange,
  previousValue,
  type,
  value,
}: MetricValueInputProps) => {
  switch (type) {
    case 'number':
      return (
        <NumberValueInput
          name={name}
          onChange={onChange}
          config={config as NumberMetricConfig}
          value={value as NumericMetricValue | undefined}
        />
      );

    case 'percentage':
      return (
        <PercentageValueInput
          name={name}
          onChange={onChange}
          value={value as NumericMetricValue | undefined}
        />
      );

    case 'duration':
      return (
        <DurationValueInput
          name={name}
          onChange={onChange}
          config={config as DurationMetricConfig}
          value={value as DurationMetricValue | undefined}
        />
      );

    case 'scale':
      return (
        <ScaleValueInput
          name={name}
          onChange={onChange}
          config={config as ScaleMetricConfig}
          value={value as NumericMetricValue | undefined}
        />
      );

    case 'range':
      return (
        <RangeValueInput
          name={name}
          onChange={onChange}
          config={config as RangeMetricConfig}
          value={value as RangeMetricValue | undefined}
          previousValue={previousValue as RangeMetricValue | undefined}
        />
      );

    case 'choice':
      return (
        <ChoiceValueInput
          name={name}
          onChange={onChange}
          config={config as ChoiceMetricConfig}
          value={
            value as
              | SingleChoiceMetricValue
              | MultiChoiceMetricValue
              | undefined
          }
        />
      );

    case 'boolean':
      return (
        <BooleanValueInput
          name={name}
          onChange={onChange}
          config={config as BooleanMetricConfig}
          value={value as BooleanMetricValue | undefined}
        />
      );

    case 'text':
      return (
        <TextValueInput
          name={name}
          onChange={onChange}
          config={config as TextMetricConfig}
          value={value as TextMetricValue | undefined}
        />
      );

    default:
      return null;
  }
};

export default MetricValueInput;
