import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import AddTraitModal from './AddTraitModal';

const renderModal = (result: unknown) => {
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
            return <AddTraitModal isOpen onClose={onClose} />;
          },
        },
        {
          path: '/habits',
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

describe(AddTraitModal.name, () => {
  it('posts the label, description and color to the habits action and closes', async () => {
    const { action, onClose } = renderModal({ ok: true, toasts: [] });

    fireEvent.change(
      await screen.findByPlaceholderText('e. g. Moderately Bad'),
      {
        target: { value: 'Calm' },
      }
    );
    fireEvent.click(screen.getByText('Add Trait'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
    expect(action).toHaveBeenCalledWith({
      color: '94a3b8',
      description: '',
      intent: 'create-trait',
      name: 'Calm',
    });
  });

  it("shows the action's field errors and stays open", async () => {
    const { onClose } = renderModal({
      error: 'Please check the highlighted fields',
      fieldErrors: { name: 'Give the trait a label' },
      ok: false,
    });

    fireEvent.click(await screen.findByText('Add Trait'));

    expect(await screen.findByText('Give the trait a label')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
