jest.mock('@context', () => ({
  useHabits: jest.fn().mockReturnValue({ updateHabit: jest.fn() }),
  useSnackbar: jest.fn().mockReturnValue({ showSnackbar: jest.fn() }),
  useTraits: jest
    .fn()
    .mockReturnValue({ traitsMap: { 1: { slug: 'trait-slug' } } }),
}));

jest.mock('@services', () => ({
  StorageBuckets: {
    HABIT_ICONS: 'habit-icons',
  },
  updateFile: jest.fn(),
  uploadFile: jest.fn(),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(),
}));

jest.mock('@utils', () => ({
  getHabitIconUrl: jest.fn(),
}));

import { useHabits, useSnackbar, useTraits } from '@context';
import type { Habit } from '@models';
import { StorageBuckets, updateFile, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import HabitItem, { type HabitItemProps } from './HabitItem';

describe(HabitItem.name, () => {
  const habit: Habit = {
    id: 123,
    name: 'Habit Name',
    description: 'Habit description',
    userId: 'uuid-42',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    iconPath: 'icon-path',
    traitId: 1,
  };
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const props: HabitItemProps = {
    habit,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  it('should set name and description from props', () => {
    const { getByText } = render(<HabitItem {...props} />);
    expect(getByText(habit.name)).toBeDefined();
    expect(getByText(habit.description)).toBeDefined();
  });

  it('should render good trait chip', async () => {
    (useTraits as jest.Mock).mockReturnValue({
      traitsMap: { 1: { slug: 'good', name: 'Good habit' } },
    });
    const { getByRole } = render(<HabitItem {...props} />);
    const habitChip = getByRole('habit-trait-chip');
    expect(habitChip).toBeDefined();
    expect(habitChip.textContent).toContain('Good habit');
    expect(habitChip.className).toContain('MuiChip-colorSuccess');
  });

  it('should render bad trait chip', () => {
    (useTraits as jest.Mock).mockReturnValue({
      traitsMap: { 1: { slug: 'bad', name: 'Bad habit' } },
    });
    const { getByRole } = render(<HabitItem {...props} />);
    const habitChip = getByRole('habit-trait-chip');
    expect(habitChip).toBeDefined();
    expect(habitChip.textContent).toContain('Bad habit');
    expect(habitChip.className).toContain('MuiChip-colorDanger');
  });

  it('should render custom trait chip', () => {
    (useTraits as jest.Mock).mockReturnValue({
      traitsMap: { 1: { slug: 'custom-trait', name: 'Custom habit' } },
    });
    const { getByRole } = render(<HabitItem {...props} />);
    const habitChip = getByRole('habit-trait-chip');
    expect(habitChip).toBeDefined();
    expect(habitChip.textContent).toContain('Custom habit');
    expect(habitChip.className).toContain('MuiChip-colorNeutral');
  });

  it('should render neutral habit chip if trait not found', () => {
    (useTraits as jest.Mock).mockReturnValue({
      traitsMap: {},
    });
    const { getByRole } = render(<HabitItem {...props} />);
    const habitChip = getByRole('habit-trait-chip');
    expect(habitChip).toBeDefined();
    expect(habitChip.textContent).toContain('Unknown');
    expect(habitChip.className).toContain('MuiChip-colorNeutral');
  });

  it('should render habit icon image', () => {
    const iconPath = 'habit-icons/uuid-42/habit-id-123.png';
    (getHabitIconUrl as jest.Mock).mockReturnValue(iconPath);
    const { getByRole } = render(<HabitItem {...props} />);
    const habitIcon = getByRole('habit-icon');
    expect(habitIcon).toBeDefined();
    expect(habitIcon.getAttribute('src')).toBe(iconPath);
  });

  it('if no file uploaded, should not call updateFile', () => {
    const mockUpdateHabit = jest.fn();
    const mockUpdateFile = jest.fn();
    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (updateFile as jest.Mock).mockReturnValue(mockUpdateFile);
    (useUser as jest.Mock).mockReturnValue({ id: 'user-id' });
    const { getByRole } = render(<HabitItem {...props} />);
    const iconInput = getByRole('habit-icon-input');
    fireEvent.change(iconInput, { target: { files: [] } });
    expect(mockUpdateHabit).not.toHaveBeenCalled();
  });

  it('on icon upload, should call updateFile and updateHabit if iconPath exists', async () => {
    const iconFile = new File([''], 'icon.png', { type: 'image/png' });
    const mockUpdateHabit = jest.fn();
    const mockShowSnackbar = jest.fn();

    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
    (useUser as jest.Mock).mockReturnValue({ id: 'user-id' });
    (updateFile as jest.Mock).mockReturnValue(Promise.resolve({}));

    const { getByRole } = render(<HabitItem {...props} />);
    const iconInput = getByRole('habit-icon-input');
    fireEvent.change(iconInput, { target: { files: [iconFile] } });

    await waitFor(() => {
      expect(updateFile).toHaveBeenCalledWith(
        StorageBuckets.HABIT_ICONS,
        'user-id/habit-id-123.png',
        iconFile
      );
      expect(mockUpdateHabit).toHaveBeenCalledWith(props.habit.id, {
        ...habit,
        iconPath: `user-id/habit-id-123.png`,
      });
      expect(mockShowSnackbar).toHaveBeenCalledWith('Icon replaced!', {
        variant: 'soft',
        color: 'success',
      });
    });
  });

  it('on icon upload, should call uploadFile and updateHabit if iconPath does not exist', async () => {
    const iconFile = new File([''], 'icon.png', { type: 'image/png' });
    const mockUpdateHabit = jest.fn();
    const mockShowSnackbar = jest.fn();

    (useUser as jest.Mock).mockReturnValue({ id: 'user-id' });
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (uploadFile as jest.Mock).mockReturnValue(
      Promise.resolve({
        data: {
          path: 'my-icon-path',
        },
        error: null,
      })
    );
    (useUser as jest.Mock).mockReturnValue({ id: 'user-id' });

    const { getByRole } = render(
      <HabitItem {...props} habit={{ ...habit, iconPath: '' }} />
    );
    const iconInput = getByRole('habit-icon-input');
    fireEvent.change(iconInput, { target: { files: [iconFile] } });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(
        StorageBuckets.HABIT_ICONS,
        'user-id/habit-id-123.png',
        iconFile
      );
      expect(mockUpdateHabit).toHaveBeenCalledWith(props.habit.id, {
        ...habit,
        iconPath: `my-icon-path`,
      });
      expect(mockShowSnackbar).toHaveBeenCalledWith('Icon uploaded!', {
        variant: 'soft',
        color: 'success',
      });
    });
  });

  it('should show danger snackbar if updateFile failed', async () => {
    const iconFile = new File([''], 'icon.png', { type: 'image/png' });
    const mockUpdateHabit = jest.fn();
    const mockShowSnackbar = jest.fn();

    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
    (updateFile as jest.Mock).mockReturnValue(
      Promise.resolve({
        data: null,
        error: new Error('Custom update failure'),
      })
    );

    const { getByRole } = render(<HabitItem {...props} />);
    const iconInput = getByRole('habit-icon-input');
    fireEvent.change(iconInput, { target: { files: [iconFile] } });

    await waitFor(() => {
      expect(updateFile).not.toHaveBeenCalledWith();
      expect(mockUpdateHabit).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith('Custom update failure', {
        variant: 'soft',
        color: 'danger',
      });
    });
  });

  it('should show danger snackbar if uploadFile failed', async () => {
    const iconFile = new File([''], 'icon.png', { type: 'image/png' });
    const mockUpdateHabit = jest.fn();
    const mockShowSnackbar = jest.fn();

    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
    (uploadFile as jest.Mock).mockReturnValue(
      Promise.resolve({
        data: null,
        error: new Error('Custom upload failure'),
      })
    );

    const { getByRole } = render(
      <HabitItem {...props} habit={{ ...habit, iconPath: '' }} />
    );
    const iconInput = getByRole('habit-icon-input');
    fireEvent.change(iconInput, { target: { files: [iconFile] } });

    await waitFor(() => {
      expect(updateFile).not.toHaveBeenCalledWith();
      expect(mockUpdateHabit).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith('Custom upload failure', {
        variant: 'soft',
        color: 'danger',
      });
    });
  });

  it('should show placeholder error in danger snackbar if uploadFile failed with empty error', async () => {
    const iconFile = new File([''], 'icon.png', { type: 'image/png' });
    const mockUpdateHabit = jest.fn();
    const mockShowSnackbar = jest.fn();

    (useHabits as jest.Mock).mockReturnValue({ updateHabit: mockUpdateHabit });
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
    (uploadFile as jest.Mock).mockReturnValue(
      Promise.resolve({
        data: null,
        error: new Error(),
      })
    );

    const { getByRole } = render(
      <HabitItem {...props} habit={{ ...habit, iconPath: '' }} />
    );
    const iconInput = getByRole('habit-icon-input');
    fireEvent.change(iconInput, { target: { files: [iconFile] } });

    await waitFor(() => {
      expect(updateFile).not.toHaveBeenCalledWith();
      expect(mockUpdateHabit).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to upload icon', {
        variant: 'soft',
        color: 'danger',
      });
    });
  });

  it('should call onEdit on edit icon button click', () => {
    const { getByRole } = render(<HabitItem {...props} />);
    fireEvent.click(getByRole('edit-habit-button'));
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should call onDelete on delete icon button click', () => {
    const { getByRole } = render(<HabitItem {...props} />);
    fireEvent.click(getByRole('delete-habit-button'));
    expect(mockOnEdit).toHaveBeenCalled();
  });
});
