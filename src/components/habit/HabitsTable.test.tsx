import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe } from 'vitest';

import { useHabits, useTraits } from '@stores';
import { makeTestHabit, makeTestTrait } from '@tests';

import HabitsTable from './HabitsTable';

vi.mock('@services', () => {
  return {
    getHabitTotalEntries: vi.fn().mockResolvedValue(0),
    getLatestHabitOccurrenceTimestamp: vi.fn().mockResolvedValue(0),
    getLongestHabitStreak: vi.fn().mockResolvedValue(0),
    getPublicUrl: vi.fn(),
    listHabits: vi.fn().mockReturnValue(() => {
      return [];
    }),
    StorageBuckets: {
      HABIT_ICONS: 'habit-icons',
    },
  };
});

vi.mock('@stores', () => {
  return {
    useHabits: vi.fn(),
    useMetricsActions: vi.fn().mockReturnValue({}),
    useTraits: vi.fn().mockReturnValue({}),
    useUser: vi.fn().mockReturnValue({}),
    useConfirmationActions: vi.fn().mockReturnValue({
      confirm: vi.fn().mockResolvedValue(false),
    }),
    useHabitActions: vi.fn().mockReturnValue({
      removeHabit: vi.fn(),
      updateHabit: vi.fn(),
    }),
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
    useFileField: vi.fn().mockReturnValue([null, vi.fn(), vi.fn()]),
    useTextField: vi.fn().mockReturnValue(['', vi.fn(), vi.fn(), vi.fn()]),
    ThemeMode: {
      DARK: 'dark',
      LIGHT: 'light',
      SYSTEM: 'system',
    },
    useScreenWidth: vi.fn().mockReturnValue({
      isDesktop: true,
      isMobile: false,
      screenWidth: 1400,
    }),
    useUser: vi
      .fn()
      .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
  };
});

describe(HabitsTable.name, () => {
  it('should display habits', async () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        return {
          '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa': makeTestHabit({
            description: 'Habit description #1',
            id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
            name: 'Habit name #1',
          }),
          '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ab': makeTestHabit({
            description: 'Habit description #2',
            id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ab',
            name: 'Habit name #2',
          }),
        };
      }
    );
    const { getAllByRole, getByText } = render(<HabitsTable />);
    await waitFor(() => {
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
    (useTraits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ac': makeTestTrait({
        id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ac',
        name: 'Trait name #1',
      }),
    });
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        return {
          '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa': makeTestHabit({
            description: 'Habit description #1',
            id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
            name: 'Habit name #1',
            traitId: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ac',
          }),
          '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ab': makeTestHabit({
            description: 'Habit description #2',
            id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ab',
            name: 'Habit name #2',
            traitId: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3ac',
          }),
        };
      }
    );
    const { getAllByRole, getByRole, getByTestId, queryByRole } = render(
      <HabitsTable />
    );

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

    expect(queryByRole('submit-edited-habit-button')).toBeNull();
    fireEvent.click(
      getByTestId('edit-habit-id-4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa-button')
    );
    expect(getByRole('submit-edited-habit-button')).toBeDefined();
  });
});
