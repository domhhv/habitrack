import { useUser } from '@hooks';
import { StorageBuckets, uploadFile } from '@services';
import { useSnackbarsStore, useHabitsStore } from '@stores';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import AddHabitDialogButton from './AddHabitDialogButton';

vi.mock('@stores', () => ({
  useSnackbarsStore: vi.fn(),
  useHabitsStore: vi.fn(),
  useTraitsStore: vi.fn(),
}));

vi.mock('@services', () => ({
  StorageBuckets: {
    HABIT_ICONS: 'habit-icons',
  },
  uploadFile: vi.fn(),
}));

vi.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useUser: vi.fn(),
}));

describe(AddHabitDialogButton.name, () => {
  it.skip('should handle data enter and dialog close', () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateHabit: vi.fn(),
      fetchingHabits: false,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
    });

    const { getByLabelText, getByRole, getByTestId, queryByRole } = render(
      <AddHabitDialogButton />
    );
    fireEvent.click(getByTestId('add-habit-button'));
    expect(getByRole('add-habit-dialog')).toBeInTheDocument();

    const habitName = getByLabelText('Name');
    const habitDescription = getByLabelText('Description');
    const habitTraitSelect = getByTestId('habit-trait-select').querySelector(
      'input'
    ) as HTMLInputElement;
    const icon = getByRole('habit-icon-input');

    expect(habitName).toHaveValue('');
    expect(habitDescription).toHaveValue('');
    expect(habitTraitSelect).toHaveValue('choose-trait');
    expect(icon).toHaveValue('');

    fireEvent.change(habitName, { target: { value: 'habit-name' } });
    fireEvent.change(habitDescription, {
      target: { value: 'habit-description' },
    });
    fireEvent.click(habitTraitSelect);
    fireEvent.click(getByTestId('habit-trait-id-1-option'));
    fireEvent.change(icon, { target: { files: ['icon'] } });

    expect(habitName).toHaveValue('habit-name');
    expect(habitDescription).toHaveValue('habit-description');
    expect(habitTraitSelect).toHaveValue('1');
    expect(icon).toHaveProperty('files', ['icon']);

    fireEvent.click(getByRole('close-add-habit-dialog-button'));

    expect(queryByRole('add-habit-dialog')).not.toBeInTheDocument();
  });

  it.skip('should not set habit icon if empty file uploaded', () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateHabit: vi.fn(),
      fetchingHabits: false,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
    });

    const { getByRole, getByTestId } = render(<AddHabitDialogButton />);
    fireEvent.click(getByTestId('add-habit-button'));
    expect(getByRole('add-habit-dialog')).toBeInTheDocument();

    const icon = getByRole('habit-icon-input');
    fireEvent.change(icon, { target: { files: [] } });

    expect(icon).toHaveProperty('files', []);
  });

  it.skip('should call addHabit on form submit', () => {
    const mockAddHabit = vi.fn().mockReturnValue(Promise.resolve({ id: 1 }));
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addHabit: mockAddHabit,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
    });

    const { getByRole, getByTestId } = render(<AddHabitDialogButton />);
    fireEvent.click(getByTestId('add-habit-button'));
    expect(getByRole('add-habit-dialog')).toBeInTheDocument();

    const form = getByRole('add-habit-form');

    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      expect(mockAddHabit).toHaveBeenCalled();
    });
  });

  it.skip('if habit icon uploaded, should call uploadFile and updateHabit', async () => {
    const mockAddHabit = vi.fn().mockReturnValue(Promise.resolve({ id: 1234 }));
    const mockUpdateHabit = vi.fn().mockReturnValue(Promise.resolve({}));
    const mockShowSnackbar = vi.fn();
    (uploadFile as ReturnType<typeof vi.fn>).mockReturnValue(
      Promise.resolve({ data: { path: 'icon-path' } })
    );
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addHabit: mockAddHabit,
      updateHabit: mockUpdateHabit,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 'uuid-42',
    });
    (useSnackbarsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });

    const { getByRole, getByTestId, getByLabelText } = render(
      <AddHabitDialogButton />
    );
    fireEvent.click(getByTestId('add-habit-button'));
    expect(getByRole('add-habit-dialog')).toBeInTheDocument();

    const form = getByRole('add-habit-form');
    const icon = getByRole('habit-icon-input');
    const file = new File(['icon'], 'icon.png', { type: 'image/png' });
    fireEvent.change(icon, { target: { files: [file] } });
    const habitName = getByLabelText('Name');
    const habitDescription = getByLabelText('Description');
    const habitTraitSelect = getByTestId('habit-trait-select').querySelector(
      'input'
    ) as HTMLInputElement;

    fireEvent.change(habitName, { target: { value: 'habit-name' } });
    fireEvent.change(habitDescription, {
      target: { value: 'habit-description' },
    });
    fireEvent.click(habitTraitSelect);
    fireEvent.click(getByTestId('habit-trait-id-1-option'));

    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(
        StorageBuckets.HABIT_ICONS,
        'uuid-42/habit-id-1234.png',
        file
      );
      expect(mockUpdateHabit).toHaveBeenCalledWith(1234, {
        name: 'habit-name',
        description: 'habit-description',
        userId: 'uuid-42',
        iconPath: 'uuid-42/habit-id-1234.png',
        traitId: 1,
      });
    });
  });
});
