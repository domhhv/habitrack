import { useHabits, useTraits } from '@stores';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestHabit, makeTestTrait } from '@tests';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import HabitsPage from './HabitsPage';

vi.mock('@services', () => {
  return {
    StorageBuckets: {
      HABIT_ICONS: 'habit-icons',
    },
    listHabits: vi.fn().mockReturnValue(() => {
      return [];
    }),
    getLatestHabitOccurrenceTimestamp: vi.fn().mockResolvedValue(0),
    getLongestHabitStreak: vi.fn().mockResolvedValue(0),
    getHabitTotalEntries: vi.fn().mockResolvedValue(0),
  };
});

vi.mock('@stores', () => {
  return {
    useHabits: vi.fn(),
    useHabitActions: vi.fn().mockReturnValue({
      updateHabit: vi.fn(),
      removeHabit: vi.fn(),
    }),
    useTraits: vi.fn().mockReturnValue([]),
    useNoteActions: vi.fn().mockReturnValue({
      addNote: vi.fn(),
    }),
    useTraitActions: vi.fn().mockReturnValue({
      addTrait: vi.fn(),
    }),
  };
});

vi.mock('@hooks', () => {
  return {
    ThemeMode: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    },
    useUser: vi
      .fn()
      .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
    useTextField: vi.fn().mockReturnValue(['', vi.fn(), vi.fn(), vi.fn()]),
    useFileField: vi.fn().mockReturnValue([null, vi.fn(), vi.fn()]),
    useScreenWidth: vi.fn().mockReturnValue({
      screenWidth: 1400,
      isMobile: false,
      isDesktop: true,
    }),
  };
});

describe(HabitsPage.name, () => {
  it('should display habits', async () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        return [
          makeTestHabit({
            id: 1,
            name: 'Habit name #1',
            description: 'Habit description #1',
          }),
          makeTestHabit({
            id: 2,
            name: 'Habit name #2',
            description: 'Habit description #2',
          }),
        ];
      }
    );
    const { getByText, getAllByRole } = render(<HabitsPage />);
    await waitFor(() => {
      expect(getByText('Your habits'));
      expect(getByText('Habit name #1'));
      expect(getByText('Habit name #2'));
      expect(getByText('Habit description #1'));
      expect(getByText('Habit description #2'));

      const editButtons = getAllByRole('edit-habit-button');
      const deleteButtons = getAllByRole('delete-habit-button');

      expect(editButtons[0]).toHaveAttribute(
        'aria-label',
        'Edit habit: Habit name #1'
      );
      expect(editButtons[1]).toHaveAttribute(
        'aria-label',
        'Edit habit: Habit name #2'
      );
      expect(deleteButtons[0]).toHaveAttribute(
        'aria-label',
        'Delete habit: Habit name #1'
      );
      expect(deleteButtons[1]).toHaveAttribute(
        'aria-label',
        'Delete habit: Habit name #2'
      );
    });
  });

  it('should open edit dialog on edit icon button click', async () => {
    (useTraits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      makeTestTrait(),
    ]);
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        return [
          makeTestHabit({
            id: 1,
            name: 'Habit name #1',
            description: 'Habit description #1',
          }),
          makeTestHabit({
            id: 42,
            name: 'Habit name #42',
            description: 'Habit description #42',
          }),
        ];
      }
    );
    const { queryByRole, getByRole, getByTestId, getAllByRole } = render(
      <HabitsPage />
    );

    const editButtons = getAllByRole('edit-habit-button');
    const deleteButtons = getAllByRole('delete-habit-button');
    expect(editButtons[0]).toHaveAttribute(
      'aria-label',
      'Edit habit: Habit name #1'
    );
    expect(editButtons[1]).toHaveAttribute(
      'aria-label',
      'Edit habit: Habit name #42'
    );
    expect(deleteButtons[0]).toHaveAttribute(
      'aria-label',
      'Delete habit: Habit name #1'
    );
    expect(deleteButtons[1]).toHaveAttribute(
      'aria-label',
      'Delete habit: Habit name #42'
    );

    expect(queryByRole('submit-edited-habit-button')).toBeNull();
    fireEvent.click(getByTestId('edit-habit-id-42-button'));
    expect(getByRole('submit-edited-habit-button')).toBeDefined();
  });
});
