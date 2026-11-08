import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import type { HabitMetric } from '@models';
import { makeTestHabit } from '@tests';

import AddStockForm from './AddStockForm';

const habit = makeTestHabit({
  id: 'habit-1',
  metricDefinitions: [
    {
      config: {},
      id: 'metric-1',
      isRequired: false,
      name: 'Strength',
      sortOrder: 0,
      type: 'number',
    } as unknown as HabitMetric,
  ],
});

const renderForm = (result: unknown) => {
  const action = vi.fn();
  const onClose = vi.fn();

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      loader: () => {
        return { user: { id: 'user-1' } };
      },
      children: [
        {
          path: '/',
          Component: () => {
            return <AddStockForm habit={habit} onClose={onClose} />;
          },
        },
        {
          path: '/habits/:habitId',
          action: async ({ request }) => {
            action(Object.fromEntries(await request.formData()));

            return result;
          },
        },
      ],
    },
  ]);

  render(<Stub initialEntries={['/']} />);

  return { action, onClose };
};

describe(AddStockForm.name, () => {
  it('posts the stock fields and metric defaults to the habit action and closes', async () => {
    const { action, onClose } = renderForm({ ok: true, toasts: [] });

    fireEvent.change(
      await screen.findByPlaceholderText('e.g. Velo Berry Frost 14mg'),
      { target: { value: 'Pack' } }
    );
    const totalItems = screen.getByPlaceholderText('e.g. 20');
    fireEvent.change(totalItems, { target: { value: '20' } });
    fireEvent.blur(totalItems);
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        cost: '',
        currency: 'EUR',
        intent: 'add-stock',
        isQuantifiable: 'on',
        name: 'Pack',
        totalItems: '20',
      })
    );
    expect(
      JSON.parse(action.mock.calls[0][0].metricDefaults as string)
    ).toMatchObject({ compound: {}, values: expect.any(Object) });
  });

  it("shows the action's field errors and stays open", async () => {
    const { onClose } = renderForm({
      error: 'Please check the highlighted fields',
      fieldErrors: { currency: 'Use a 3-letter code, e.g. EUR' },
      ok: false,
    });

    fireEvent.change(
      await screen.findByPlaceholderText('e.g. Velo Berry Frost 14mg'),
      { target: { value: 'Pack' } }
    );
    const totalItems = screen.getByPlaceholderText('e.g. 20');
    fireEvent.change(totalItems, { target: { value: '5' } });
    fireEvent.blur(totalItems);
    fireEvent.click(screen.getByText('Save'));

    expect(
      await screen.findByText('Use a 3-letter code, e.g. EUR')
    ).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
