import {
  Chip,
  Input,
  Label,
  Slider,
  Switch,
  TextArea,
  TextField,
  NumberField,
} from '@heroui/react';
import React from 'react';

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

  React.useEffect(() => {
    if (config.min !== undefined && value === undefined) {
      onChange({ numericValue: config.min });
    }
  }, [config.min, onChange, value]);

  return (
    <NumberField
      variant="secondary"
      minValue={config.min}
      maxValue={config.max}
      value={value?.numericValue ?? 0}
      formatOptions={
        config.decimalPlaces != null
          ? { maximumFractionDigits: config.decimalPlaces }
          : undefined
      }
      onChange={(v) => {
        if (isNaN(v)) {
          onChange(undefined);

          return;
        }

        onChange({ numericValue: v });
      }}
    >
      <Label className="text-sm">{label}</Label>
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input />
        <NumberField.IncrementButton />
      </NumberField.Group>
    </NumberField>
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
      minValue={0}
      maxValue={100}
      value={value?.numericValue ?? 50}
      onChange={(v) => {
        const numVal = typeof v === 'number' ? v : (v as number[])[0];
        onChange({ numericValue: numVal });
      }}
    >
      <Label>{name}</Label>
      <Slider.Output>
        {({ state }) => {
          return `${state.values[0]}%`;
        }}
      </Slider.Output>
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
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
      <NumberField
        minValue={0}
        variant="secondary"
        value={Math.floor(ms / 60000)}
        onChange={(v) => {
          if (isNaN(v)) {
            onChange(undefined);

            return;
          }

          onChange({ durationMs: v * 60000 });
        }}
      >
        <Label className="text-sm">{`${name} (min)`}</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
    );
  }

  if (format === 'seconds') {
    return (
      <NumberField
        minValue={0}
        variant="secondary"
        value={totalSeconds}
        onChange={(v) => {
          if (isNaN(v)) {
            onChange(undefined);

            return;
          }

          onChange({ durationMs: v * 1000 });
        }}
      >
        <Label className="text-sm">{`${name} (sec)`}</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
    );
  }

  return (
    <div className="flex gap-2">
      <NumberField
        minValue={0}
        value={hours}
        variant="secondary"
        onChange={(v) => {
          handleChange(isNaN(v) ? 0 : v, minutes, seconds);
        }}
      >
        <Label className="text-sm">Hours</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
      <NumberField
        minValue={0}
        maxValue={59}
        value={minutes}
        variant="secondary"
        onChange={(v) => {
          handleChange(hours, isNaN(v) ? 0 : v, seconds);
        }}
      >
        <Label className="text-sm">Min</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
      {format === 'hh:mm:ss' && (
        <NumberField
          minValue={0}
          maxValue={59}
          value={seconds}
          variant="secondary"
          onChange={(v) => {
            handleChange(hours, minutes, isNaN(v) ? 0 : v);
          }}
        >
          <Label className="text-sm">Sec</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
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
      step={config.step}
      value={currentVal}
      minValue={config.min}
      maxValue={config.max}
      onChange={(v) => {
        const numVal = typeof v === 'number' ? v : (v as number[])[0];
        onChange({ numericValue: numVal });
      }}
    >
      <Label>{label}</Label>
      <Slider.Output />
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
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
      const nextValue =
        config.max != null
          ? Math.min(previousValue.rangeTo + 1, config.max)
          : previousValue.rangeTo + 1;

      return { rangeFrom: nextValue, rangeTo: nextValue };
    }

    return { rangeFrom: 0, rangeTo: 0 };
  };

  const defaultValue = getDefaultValue();

  React.useEffect(() => {
    if (
      value === undefined &&
      (defaultValue.rangeFrom !== 0 || defaultValue.rangeTo !== 0)
    ) {
      onChange({
        rangeFrom: defaultValue.rangeFrom,
        rangeTo: defaultValue.rangeTo,
      });
    }
  }, [defaultValue.rangeFrom, defaultValue.rangeTo, onChange, value]);

  return (
    <div>
      <p className="mb-2 text-sm">{name}</p>
      <div className="flex gap-2">
        <NumberField
          aria-label="From"
          variant="secondary"
          minValue={config.min}
          maxValue={config.max}
          value={value?.rangeFrom ?? defaultValue.rangeFrom}
          onChange={(v) => {
            onChange({
              rangeFrom: isNaN(v) ? 0 : v,
              rangeTo: value?.rangeTo ?? defaultValue.rangeTo,
            });
          }}
        >
          {config.unit && <Label className="text-sm">{config.unit} from</Label>}
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <NumberField
          aria-label="To"
          variant="secondary"
          minValue={config.min}
          maxValue={config.max}
          value={value?.rangeTo ?? defaultValue.rangeTo}
          onChange={(v) => {
            onChange({
              rangeFrom: value?.rangeFrom ?? defaultValue.rangeFrom,
              rangeTo: isNaN(v) ? 0 : v,
            });
          }}
        >
          {config.unit && <Label className="text-sm">{config.unit} to</Label>}
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
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
              color={isSelected ? 'accent' : 'default'}
              variant={isSelected ? 'primary' : 'secondary'}
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
      onChange={(v: boolean) => {
        onChange({ booleanValue: v });
      }}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label className="text-sm">
          {name}: {value?.booleanValue ? trueLabel : falseLabel}
        </Label>
      </Switch.Content>
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
  if (config.multiline) {
    return (
      <TextField
        variant="secondary"
        value={value?.textValue ?? ''}
        onChange={(textValue: string) => {
          onChange({ textValue });
        }}
      >
        <Label className="text-sm">{name}</Label>
        <TextArea
          maxLength={config.maxLength}
          placeholder={config.placeholder || ''}
        />
      </TextField>
    );
  }

  return (
    <TextField
      variant="secondary"
      value={value?.textValue ?? ''}
      onChange={(textValue: string) => {
        onChange({ textValue });
      }}
    >
      <Label className="text-sm">{name}</Label>
      <Input
        maxLength={config.maxLength}
        placeholder={config.placeholder || ''}
      />
    </TextField>
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
