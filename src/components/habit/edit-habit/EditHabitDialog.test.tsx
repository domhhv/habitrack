jest.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useTraits: jest
    .fn()
    .mockReturnValue({ traitsMap: { 1: { slug: 'trait-slug' } } }),
  useTextField: jest
    .fn()
    .mockReturnValue(['', jest.fn(), jest.fn(), jest.fn()]),
  useFileField: jest.fn().mockReturnValue([null, jest.fn(), jest.fn()]),
}));

jest.mock('@context', () => ({
  useHabits: jest.fn().mockReturnValue({ updateHabit: jest.fn() }),
  useTraits: jest.fn().mockReturnValue({
    traitsMap: { 1: { label: 'Trait label', slug: 'trait-slug' } },
    allTraits: [{ id: 1, label: 'Trait label', slug: 'trait-slug' }],
  }),
  TraitsProvider: jest.fn(({ children }) => children),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest
    .fn()
    .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
}));

import { TraitsProvider, useHabits, useTraits } from '@context';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import EditHabitDialog, { type EditHabitDialogProps } from './EditHabitDialog';

describe(EditHabitDialog.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const props: EditHabitDialogProps = {
    open: true,
    onClose: jest.fn(),
    habit: {
      id: 7,
      createdAt: '2024-02-21T17:30:08.886124+00:00',
      updatedAt: null,
      userId: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
      name: 'Habit Name',
      description: 'Habit description',
      traitId: 42,
      iconPath: '',
    },
  };

  it.skip('should set values from props', () => {
    const { getByRole, getByLabelText } = render(
      <TraitsProvider>
        <EditHabitDialog {...props} />
      </TraitsProvider>
    );
    expect(getByRole('dialog')).toBeDefined();
    expect(getByLabelText('Name')).toHaveProperty('value', 'Habit Name');
    expect(getByLabelText('Description (optional)')).toHaveProperty(
      'value',
      'Habit description'
    );
  });

  it('should not render if habit is not provided', () => {
    const { queryByRole } = render(
      <TraitsProvider>
        <EditHabitDialog {...props} habit={null} />
      </TraitsProvider>
    );
    expect(queryByRole('dialog')).toBeNull();
  });

  it('should not render if open is false', () => {
    const { queryByRole } = render(
      <TraitsProvider>
        <EditHabitDialog {...props} open={false} />
      </TraitsProvider>
    );
    expect(queryByRole('dialog')).toBeNull();
  });

  it('should call onClose when closed', async () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <TraitsProvider>
        <EditHabitDialog {...props} onClose={onClose} />
      </TraitsProvider>
    );
    const closeIcon = getByLabelText('Close');
    fireEvent.click(closeIcon);
    expect(onClose).toHaveBeenCalled();
  });

  it.skip('should call updateHabit when submitted', async () => {
    const mockUpdateHabit = jest.fn();
    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (useTraits as jest.Mock).mockReturnValue({
      traitsMap: { 1: { label: 'Trait label', slug: 'trait-slug' } },
      allTraits: [{ id: 1, label: 'Trait label', slug: 'trait-slug' }],
    });
    const { getByRole, getByLabelText } = render(
      <TraitsProvider>
        <EditHabitDialog {...props} />
      </TraitsProvider>
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
