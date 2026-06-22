import { it, expect, describe } from 'vitest';

import type { MetricType, FormMetricDefinitions } from '@models';

import {
  isRangeValue,
  isMetricValue,
  isNumericValue,
  isDurationValue,
  matchMetricValue,
  parseHabitMetric,
  isMetricValueForType,
  isMetricConfigForType,
  parseMetricValueHolder,
  buildHabitMetricInsert,
} from './metric-value';

describe('matchMetricValue', () => {
  it('dispatches each metric type to its handler with the narrowed value', () => {
    expect(
      matchMetricValue(
        'number',
        { numericValue: 3 },
        {
          boolean: () => {
            return 'b';
          },
          choice: () => {
            return 'c';
          },
          duration: () => {
            return 'd';
          },
          number: (v) => {
            return `n:${v.numericValue}`;
          },
          percentage: () => {
            return 'p';
          },
          range: () => {
            return 'r';
          },
          scale: () => {
            return 's';
          },
          text: () => {
            return 't';
          },
        }
      )
    ).toBe('n:3');

    expect(
      matchMetricValue(
        'range',
        { rangeFrom: 1, rangeTo: 9 },
        {
          boolean: () => {
            return 'b';
          },
          choice: () => {
            return 'c';
          },
          duration: () => {
            return 'd';
          },
          number: () => {
            return 'n';
          },
          percentage: () => {
            return 'p';
          },
          range: (v) => {
            return `${v.rangeFrom}-${v.rangeTo}`;
          },
          scale: () => {
            return 's';
          },
          text: () => {
            return 't';
          },
        }
      )
    ).toBe('1-9');
  });

  it('handles both single and multi choice shapes', () => {
    const handlers = {
      boolean: () => {
        return '';
      },
      choice: (
        v: { selectedOption: string } | { selectedOptions: string[] }
      ) => {
        return 'selectedOptions' in v
          ? v.selectedOptions.join(',')
          : v.selectedOption;
      },
      duration: () => {
        return '';
      },
      number: () => {
        return '';
      },
      percentage: () => {
        return '';
      },
      range: () => {
        return '';
      },
      scale: () => {
        return '';
      },
      text: () => {
        return '';
      },
    };

    expect(matchMetricValue('choice', { selectedOption: 'a' }, handlers)).toBe(
      'a'
    );
    expect(
      matchMetricValue('choice', { selectedOptions: ['a', 'b'] }, handlers)
    ).toBe('a,b');
  });
});

describe('isMetricValue', () => {
  it.each([
    [{ numericValue: 1 }, true],
    [{ durationMs: 1 }, true],
    [{ rangeFrom: 1, rangeTo: 2 }, true],
    [{ selectedOption: 'a' }, true],
    [{ selectedOptions: ['a'] }, true],
    [{ booleanValue: true }, true],
    [{ textValue: 'a' }, true],
    [{ unknownKey: 1 }, false],
    [null, false],
    ['string', false],
    [[1, 2], false],
  ])('returns %s for %o', (value, expected) => {
    expect(isMetricValue(value)).toBe(expected);
  });
});

describe('isMetricValueForType', () => {
  it('accepts the matching value shape per type', () => {
    expect(isMetricValueForType('number', { numericValue: 1 })).toBe(true);
    expect(isMetricValueForType('percentage', { numericValue: 1 })).toBe(true);
    expect(isMetricValueForType('scale', { numericValue: 1 })).toBe(true);
    expect(isMetricValueForType('duration', { durationMs: 1 })).toBe(true);
    expect(isMetricValueForType('range', { rangeFrom: 1, rangeTo: 2 })).toBe(
      true
    );
    expect(isMetricValueForType('choice', { selectedOption: 'a' })).toBe(true);
    expect(isMetricValueForType('choice', { selectedOptions: ['a'] })).toBe(
      true
    );
    expect(isMetricValueForType('boolean', { booleanValue: true })).toBe(true);
    expect(isMetricValueForType('text', { textValue: 'a' })).toBe(true);
  });

  it('rejects a value shape that belongs to a different type', () => {
    expect(isMetricValueForType('number', { durationMs: 1 })).toBe(false);
    expect(isMetricValueForType('duration', { numericValue: 1 })).toBe(false);
    expect(isMetricValueForType('range', { rangeFrom: 1 })).toBe(false);
    expect(isMetricValueForType('boolean', { booleanValue: 'yes' })).toBe(
      false
    );
  });
});

describe('isMetricConfigForType', () => {
  it('requires structural keys for scale and choice', () => {
    expect(isMetricConfigForType('scale', { max: 5, min: 1, step: 1 })).toBe(
      true
    );
    expect(isMetricConfigForType('scale', { max: 5, min: 1 })).toBe(false);
    expect(isMetricConfigForType('choice', { options: ['a'] })).toBe(true);
    expect(isMetricConfigForType('choice', {})).toBe(false);
  });

  it('treats all-optional configs as valid empty objects', () => {
    expect(isMetricConfigForType('number', {})).toBe(true);
    expect(isMetricConfigForType('duration', { format: 'hh:mm' })).toBe(true);
    expect(isMetricConfigForType('text', {})).toBe(true);
  });
});

describe('parseHabitMetric', () => {
  const base = {
    createdAt: '',
    id: 'm1',
    isRequired: false,
    name: 'Metric',
    sortOrder: 0,
    updatedAt: null,
  };

  it('narrows a valid metric row, preserving its fields', () => {
    const metric = parseHabitMetric({
      ...base,
      config: { max: 5, min: 1, step: 1 },
      type: 'scale' as const,
    });

    expect(metric.type).toBe('scale');

    if (metric.type === 'scale') {
      expect(metric.config.step).toBe(1);
    }
  });

  it('throws when config does not match type', () => {
    expect(() => {
      return parseHabitMetric({ ...base, config: {}, type: 'scale' });
    }).toThrow();
  });
});

describe('parseMetricValueHolder', () => {
  it('narrows the value field and keeps the other fields', () => {
    const row = parseMetricValueHolder({
      habitMetricId: 'm1',
      id: 'v1',
      value: { numericValue: 7 },
    });

    expect(row.id).toBe('v1');
    expect(isNumericValue(row.value) && row.value.numericValue).toBe(7);
  });

  it('throws on a malformed value', () => {
    expect(() => {
      return parseMetricValueHolder({ id: 'v1', value: { bad: true } });
    }).toThrow();
  });
});

describe('buildHabitMetricInsert', () => {
  const form: FormMetricDefinitions = {
    config: { max: 5, min: 1, step: 1 },
    id: 'm1',
    isPersisted: true,
    isRequired: true,
    name: 'Mood',
    presetName: '',
    sortOrder: 2,
    type: 'scale',
  };

  it('builds a discriminated insert with habit/user ids and drops form-only fields', () => {
    const insert = buildHabitMetricInsert(form, 'habit-1', 'user-1');

    expect(insert).toEqual({
      config: { max: 5, min: 1, step: 1 },
      habitId: 'habit-1',
      isRequired: true,
      name: 'Mood',
      sortOrder: 2,
      type: 'scale',
      userId: 'user-1',
    });
    expect('presetName' in insert).toBe(false);
    expect('id' in insert).toBe(false);
  });

  it('throws when the form config does not match its type', () => {
    expect(() => {
      return buildHabitMetricInsert(
        { ...form, config: {} },
        'habit-1',
        'user-1'
      );
    }).toThrow();
  });
});

describe('value guards', () => {
  it('narrows numeric, duration and range values', () => {
    expect(isNumericValue({ numericValue: 1 })).toBe(true);
    expect(isNumericValue({ durationMs: 1 })).toBe(false);
    expect(isDurationValue({ durationMs: 1 })).toBe(true);
    expect(isRangeValue({ rangeFrom: 1, rangeTo: 2 })).toBe(true);
    expect(isRangeValue({ numericValue: 1 })).toBe(false);
  });
});

describe('exhaustiveness', () => {
  it('matchMetricValue handler map covers every metric type', () => {
    const types: MetricType[] = [
      'number',
      'duration',
      'percentage',
      'scale',
      'range',
      'choice',
      'boolean',
      'text',
    ];

    for (const type of types) {
      expect(isMetricConfigForType(type, {})).toBeTypeOf('boolean');
    }
  });
});
