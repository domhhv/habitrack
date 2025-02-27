import { useHabitsStore, useTraitsStore } from '@stores';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestTrait } from '@tests';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import EditHabitDialog, { type EditHabitDialogProps } from './EditHabitDialog';

vi.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useTextField: vi.fn().mockReturnValue(['', vi.fn(), vi.fn(), vi.fn()]),
  useFileField: vi.fn().mockReturnValue([null, vi.fn(), vi.fn()]),
  useUser: vi
    .fn()
    .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
}));

vi.mock('@stores', () => ({
  useHabitsStore: vi.fn().mockReturnValue({
    updateHabit: vi.fn(),
    habitIdBeingUpdated: null,
  }),
  useTraitsStore: vi.fn().mockReturnValue({ traits: [] }),
}));

describe(EditHabitDialog.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const props: EditHabitDialogProps = {
    onClose: vi.fn(),
    habit: {
      id: 7,
      createdAt: '2024-02-21T17:30:08.886124+00:00',
      updatedAt: null,
      userId: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
      name: 'Habit Name',
      description: 'Habit description',
      traitId: 42,
      iconPath: '',
      trait: {
        name: 'Trait name',
        color: 'blue',
      },
    },
  };

  it.skip('should set values from props', () => {
    const { getByRole, getByLabelText } = render(
      <EditHabitDialog {...props} />
    );
    expect(getByRole('dialog')).toBeDefined();
    expect(getByLabelText('Name')).toHaveProperty('value', 'Habit Name');
    expect(getByLabelText('Description (optional)')).toHaveProperty(
      'value',
      'Habit description'
    );
  });

  it('should not render if habit is not provided', () => {
    const { queryByRole } = render(<EditHabitDialog {...props} habit={null} />);
    expect(queryByRole('dialog')).toBeNull();
  });

  it('should call onClose when closed', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(
      <EditHabitDialog {...props} onClose={onClose} />
    );
    const closeIcon = getByLabelText('Close');
    fireEvent.click(closeIcon);
    expect(onClose).toHaveBeenCalled();
  });

  it.skip('should call updateHabit when submitted', async () => {
    const mockUpdateHabit = vi.fn();
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateHabit: mockUpdateHabit,
    });
    (useTraitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      traits: [makeTestTrait()],
    });
    const { getByRole, getByLabelText } = render(
      <EditHabitDialog {...props} />
    );
    const nameInput = getByLabelText('Name');
    const descriptionInput = getByLabelText('Description (optional)');
    const submitButton = getByRole('submit-edited-habit-button');
    const updatedAt = new Date();
    updatedAt.setMilliseconds(0);
    updatedAt.setSeconds(0);
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'New Habit Name' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'New habit description' },
      });
      fireEvent.click(submitButton);
    });
    await waitFor(() =>
      expect(mockUpdateHabit).toHaveBeenCalledWith(7, {
        createdAt: '2024-02-21T17:30:08.886124+00:00',
        updatedAt: updatedAt.toISOString(),
        userId: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
        name: 'New Habit Name',
        description: 'New habit description',
        traitId: null,
        iconPath: '',
      })
    );
  });
});
