import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import AddHabitDialogButton from './AddHabitDialogButton';

vi.mock('@hooks', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    useTraits: vi.fn().mockReturnValue({}),
    useUser: vi.fn().mockReturnValue({ id: 'user-1' }),
  };
});

describe(AddHabitDialogButton.name, () => {
  it('opens the file picker from the upload button and shows the picked icon', async () => {
    const Stub = createRoutesStub([
      { Component: AddHabitDialogButton, path: '/habits' },
    ]);
    const { findByRole, findByTestId, findByText } = render(
      <Stub initialEntries={['/habits']} />
    );

    fireEvent.click(await findByTestId('add-habit-button'));

    const iconInput = (await findByRole(
      'habit-icon-input'
    )) as HTMLInputElement;
    const openPicker = vi.spyOn(iconInput, 'click');

    fireEvent.click(await findByText('Upload habit icon'));

    expect(openPicker).toHaveBeenCalledOnce();

    fireEvent.change(iconInput, {
      target: { files: [new File(['icon'], 'running.png')] },
    });

    expect(await findByText('running.png')).toBeInTheDocument();
  });

  it('posts the habit fields, icon and metric definitions to the habits action', async () => {
    const action = vi.fn();
    const Stub = createRoutesStub([
      {
        Component: Outlet,
        id: 'app',
        children: [
          {
            Component: AddHabitDialogButton,
            path: '/habits',
            action: async ({ request }) => {
              /**
               * Node can't parse a jsdom file back out of a multipart body, so the test reads the
               * raw body and only checks that the icon part is there.
               */
              action(await request.text());

              return { ok: true, toasts: [] };
            },
          },
        ],
      },
    ]);
    render(<Stub initialEntries={['/habits']} />);

    fireEvent.click(await screen.findByTestId('add-habit-button'));
    fireEvent.change(await screen.findByPlaceholderText('Enter habit name'), {
      target: { value: 'Running' },
    });
    fireEvent.change(await screen.findByRole('habit-icon-input'), {
      target: { files: [new File(['icon'], 'running.png')] },
    });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    const body = action.mock.calls[0][0] as string;

    for (const [name, value] of [
      ['intent', 'create-habit'],
      ['metricDefinitions', '[]'],
      ['name', 'Running'],
    ]) {
      expect(body).toContain(`name="${name}"\r\n\r\n${value}\r\n`);
    }

    expect(body).toContain('name="icon"; filename=');
  });
});
