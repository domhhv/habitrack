import type {
  MetricType,
  MetricValue,
  RangeMetricValue,
  HabitMetricInsert,
  MetricValueByType,
  MetricConfigByType,
  NumericMetricValue,
  DurationMetricValue,
  FormMetricDefinitions,
} from '@models';

/**
 * A habit metric row as it arrives from the database (camelcased): discriminated by `type`, with
 * `config` still untyped (`Json`) until validated. Generic over the surrounding fields `T` so the
 * same predicate serves both full metric rows and the trimmed `metricDefinitions` shape.
 */
type RawHabitMetric = { config: unknown; type: MetricType };

/**
 * The discriminated `config` narrowing produced by validating a `RawHabitMetric` of shape T.
 */
type WithTypedConfig<T extends RawHabitMetric> = {
  [K in MetricType]: Omit<T, 'config' | 'type'> & {
    config: MetricConfigByType[K];
    type: K;
  };
}[MetricType];

type MetricValueHandlers<R> = {
  [T in MetricType]: (value: MetricValueByType[T]) => R;
};

/**
 * Dispatches a metric value to the handler for its metric type, narrowing the value to that
 * type's concrete shape. Generic over T so `type` and `value` correlate — no type assertion is
 * needed here or at call sites.
 *
 * Callers always pass the `type` of the value's own metric definition; the value's runtime shape
 * is validated on the way in by `isMetricValueForType` (and the `validate_metric_value` DB trigger).
 */
export const matchMetricValue = <T extends MetricType, R>(
  type: T,
  value: MetricValueByType[T],
  handlers: MetricValueHandlers<R>
): R => {
  return handlers[type](value);
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Structural runtime type predicate: is `value` any member of the MetricValue union? Narrows the
 * JSON metric `value` read from the database (where the metric `type` is not co-located, e.g. stock
 * defaults) to `MetricValue` with no cast.
 */
export const isMetricValue = (value: unknown): value is MetricValue => {
  return (
    isObject(value) &&
    ('numericValue' in value ||
      'durationMs' in value ||
      'rangeFrom' in value ||
      'selectedOption' in value ||
      'selectedOptions' in value ||
      'booleanValue' in value ||
      'textValue' in value)
  );
};

export const isMetricType = (value: unknown): value is MetricType => {
  return (
    value === 'number' ||
    value === 'boolean' ||
    value === 'duration' ||
    value === 'percentage' ||
    value === 'scale' ||
    value === 'range' ||
    value === 'choice' ||
    value === 'text'
  );
};

/**
 * Runtime type predicate: does `value` have the shape required by `type`? Generic over T, so a
 * positive result narrows `value` to `MetricValueByType[T]` with no cast. Used to type JSON metric
 * values read from the database at the service boundary.
 */
export const isMetricValueForType = <T extends MetricType>(
  type: T,
  value: unknown
): value is MetricValueByType[T] => {
  if (!isObject(value)) {
    return false;
  }

  switch (type) {
    case 'number':
    case 'percentage':
    case 'scale':
      return typeof value.numericValue === 'number';

    case 'duration':
      return typeof value.durationMs === 'number';

    case 'range':
      return (
        typeof value.rangeFrom === 'number' && typeof value.rangeTo === 'number'
      );

    case 'choice':
      return (
        typeof value.selectedOption === 'string' ||
        Array.isArray(value.selectedOptions)
      );

    case 'boolean':
      return typeof value.booleanValue === 'boolean';

    case 'text':
      return typeof value.textValue === 'string';

    default:
      return false;
  }
};

/**
 * Runtime type predicate: does `config` have the shape required by `type`? Generic over T, so a
 * positive result narrows `config` to `MetricConfigByType[T]` with no cast. Used to type JSON metric
 * configs read from the database at the service boundary.
 */
export const isMetricConfigForType = <T extends MetricType>(
  type: T,
  config: unknown
): config is MetricConfigByType[T] => {
  if (!isObject(config)) {
    return false;
  }

  switch (type) {
    case 'scale':
      return (
        typeof config.min === 'number' &&
        typeof config.max === 'number' &&
        typeof config.step === 'number'
      );

    case 'choice':
      return Array.isArray(config.options);

    default:
      return true;
  }
};

/**
 * Whole-row runtime type predicate: does `metric`'s `config` match its `type`? Narrowing the whole
 * row (rather than just the `config` field) preserves the `type`/`config` correlation the
 * discriminated union needs, so consumers of the result are cast-free. Generic over T so it serves
 * both full metric rows and the trimmed `metricDefinitions` shape.
 */
export const isHabitMetric = <T extends RawHabitMetric>(
  metric: T
): metric is T & WithTypedConfig<T> => {
  return isMetricConfigForType(metric.type, metric.config);
};

/**
 * DB-read boundary for habit metrics: validates a camelcased row's `config` against its `type` and
 * narrows it (preserving the row's other fields), throwing on malformed data. Cast-free.
 */
export const parseHabitMetric = <T extends RawHabitMetric>(
  metric: T
): WithTypedConfig<T> => {
  if (!isHabitMetric(metric)) {
    throw new Error('Malformed habit metric config');
  }

  return metric;
};

/**
 * DB-read boundary for any row carrying a metric `value` (occurrence metric values, stock metric
 * defaults). The metric `type` is not co-located on these rows, so the structural `isMetricValue`
 * guard narrows the JSON `value` to the `MetricValue` union, throwing on malformed data. Cast-free.
 */
export const parseMetricValueHolder = <T extends { value: unknown }>(
  holder: T
): Omit<T, 'value'> & { value: MetricValue } => {
  if (!isMetricValue(holder.value)) {
    throw new Error('Malformed metric value');
  }

  return { ...holder, value: holder.value };
};

/**
 * Builds a `HabitMetricInsert` from transient form state. Validating with `isHabitMetric` narrows
 * the whole metric so its `type`/`config` stay correlated when spread, which the discriminated
 * insert requires; form-only fields are dropped. Cast-free.
 */
export const buildHabitMetricInsert = (
  metric: FormMetricDefinitions,
  habitId: string,
  userId: string
): HabitMetricInsert => {
  if (!isHabitMetric(metric)) {
    throw new Error('Malformed habit metric config');
  }

  const {
    id,
    isBeingEdited,
    isPersisted,
    isToBeAdded,
    isToBeRemoved,
    isToBeUpdated,
    presetName,
    ...insert
  } = metric;

  return { ...insert, habitId, userId };
};

export const isNumericValue = (
  value: MetricValue
): value is NumericMetricValue => {
  return 'numericValue' in value;
};

export const isDurationValue = (
  value: MetricValue
): value is DurationMetricValue => {
  return 'durationMs' in value;
};

export const isRangeValue = (value: MetricValue): value is RangeMetricValue => {
  return 'rangeFrom' in value;
};
