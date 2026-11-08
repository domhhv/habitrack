import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import { makeTestHabit } from '@tests';

import HabitDetails from './HabitDetails';

vi.mock('@hooks', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    useTraits: vi.fn().mockReturnValue({}),
    useUser: vi.fn().mockReturnValue({ id: 'user-1' }),
  };
});

const habit = makeTestHabit({ id: 'habit-1', name: 'Running' });

const renderDetails = () => {
  const action = vi.fn();

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      children: [
        {
          path: '/habits/:habitId',
          action: async ({ request }) => {
            action(Object.fromEntries(await request.formData()));

            return { ok: true, toasts: [] };
          },
          Component: () => {
            return <HabitDetails habit={habit} />;
          },
        },
      ],
    },
  ]);

  render(<Stub initialEntries={['/habits/habit-1']} />);

  return { action };
};

describe(HabitDetails.name, () => {
  it('posts only the edited name', async () => {
    const { action } = renderDetails();

    fireEvent.click(await screen.findByLabelText('Edit name'));
    fireEvent.change(screen.getByPlaceholderText('Enter habit name'), {
      target: { value: 'Walking' },
    });
    fireEvent.click(screen.getByLabelText('Save name'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({
        intent: 'update-habit',
        name: 'Walking',
      });
    });
    expect(await screen.findByLabelText('Edit name')).toBeTruthy();
  });

  it('closes the editor without posting when the name is unchanged', async () => {
    const { action } = renderDetails();

    fireEvent.click(await screen.findByLabelText('Edit name'));
    fireEvent.click(screen.getByLabelText('Save name'));

    expect(await screen.findByLabelText('Edit name')).toBeTruthy();
    expect(action).not.toHaveBeenCalled();
  });
});
