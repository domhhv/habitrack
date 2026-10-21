import { it, expect, describe } from 'vitest';

import type { HabitStockWithDefaults } from '@models';

import calculateOccurrenceCost from './calculate-occurrence-cost';

const stock = (
  id: string,
  overrides: Partial<HabitStockWithDefaults> = {}
): HabitStockWithDefaults => {
  return {
    cost: 10,
    currency: 'EUR',
    id,
    totalItems: 5,
    ...overrides,
  } as HabitStockWithDefaults;
};

describe('calculateOccurrenceCost', () => {
  it('sums the per-item cost of every used stock', () => {
    expect(
      calculateOccurrenceCost(
        [stock('a'), stock('b', { cost: 3, totalItems: 3 })],
        [
          { habitStockId: 'a', quantity: 2 },
          { habitStockId: 'b', quantity: 1 },
        ]
      )
    ).toEqual({ cost: 5, currency: 'EUR' });
  });

  it('ignores usages without a quantity, cost, or item count', () => {
    expect(
      calculateOccurrenceCost(
        [stock('a'), stock('b', { cost: null }), stock('c', { totalItems: 0 })],
        [
          { habitStockId: 'a', quantity: null },
          { habitStockId: 'b', quantity: 1 },
          { habitStockId: 'c', quantity: 1 },
          { habitStockId: 'missing', quantity: 1 },
        ]
      )
    ).toEqual({ cost: null, currency: null });
  });

  it('leaves the cost empty when stocks use different currencies', () => {
    expect(
      calculateOccurrenceCost(
        [stock('a'), stock('b', { currency: 'USD' })],
        [
          { habitStockId: 'a', quantity: 1 },
          { habitStockId: 'b', quantity: 1 },
        ]
      )
    ).toEqual({ cost: null, currency: null });
  });
});
