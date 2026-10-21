import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
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
});
