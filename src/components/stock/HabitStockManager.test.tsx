import { screen, render, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import type { HabitStockWithDefaults } from '@models';
import { makeTestHabit } from '@tests';

import HabitStockManager from './HabitStockManager';

const makeStock = (
  override: Partial<HabitStockWithDefaults>
): HabitStockWithDefaults => {
  return {
    cost: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    currency: 'EUR',
    habitId: 'habit-1',
    id: crypto.randomUUID(),
    isDepleted: false,
    metricDefaults: [],
    name: 'Stock',
    purchasedAt: '2026-10-01T00:00:00.000Z',
    remainingItems: null,
    totalItems: null,
    updatedAt: null,
    usageCount: 0,
    userId: 'user-1',
    ...override,
  };
};

const habit = makeTestHabit({
  id: 'habit-1',
  stocks: [
    makeStock({ id: 'stock-1', name: 'Coffee beans' }),
    makeStock({ id: 'stock-2', name: 'Tea leaves' }),
  ],
});

const renderManager = () => {
  const action = vi.fn();

  const Stub = createRoutesStub([
    {
      path: '/habits/:habitId',
      action: async ({ request }) => {
        action(Object.fromEntries(await request.formData()));

        return new Promise(() => {});
      },
      Component: () => {
        return <HabitStockManager habit={habit} />;
      },
    },
  ]);

  render(<Stub initialEntries={['/habits/habit-1']} />);

  return { action };
};

describe(HabitStockManager.name, () => {
  it('moves a stock to the depleted list while the change is pending', async () => {
    renderManager();

    const [coffeeToggle] = await screen.findAllByLabelText('Mark as depleted');
    fireEvent.click(coffeeToggle);

    expect(await screen.findByLabelText('Mark as active')).toBeTruthy();

    const depletedLabel = screen.getByText('Depleted', { selector: 'p' });
    const coffee = screen.getByText('Coffee beans');

    expect(
      depletedLabel.compareDocumentPosition(coffee) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
