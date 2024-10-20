import { HabitsProvider, TraitsProvider, useHabits } from '@context';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import React from 'react';

import HabitsPage from './HabitsPage';

jest.mock('@context', () => ({
  TraitsProvider: jest.fn(({ children }) => children),
  HabitsProvider: jest.fn(({ children }) => children),
  useTraits: jest.fn().mockReturnValue({
    allTraits: [],
  }),
  useHabits: jest.fn(),
  useSnackbar: jest.fn().mockReturnValue({}),
  useOccurrences: jest.fn().mockReturnValue({
    removeOccurrencesByHabitId: jest.fn(),
    allOccurrences: [],
  }),
}));

jest.mock('@services', () => ({
  StorageBuckets: {
    HABIT_ICONS: 'habit-icons',
  },
  listHabits: jest.fn().mockReturnValue(() => []),
  getLatestHabitOccurrenceTimestamp: jest.fn().mockResolvedValue(0),
  getLongestHabitStreak: jest.fn().mockResolvedValue(0),
  getHabitTotalEntries: jest.fn().mockResolvedValue(0),
}));

jest.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useDocumentTitle: jest.fn(),
  useTextField: jest
    .fn()
    .mockReturnValue(['', jest.fn(), jest.fn(), jest.fn()]),
  useFileField: jest.fn().mockReturnValue([null, jest.fn(), jest.fn()]),
}));

describe(HabitsPage.name, () => {
  it('should display habits', async () => {
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits: [
        makeTestHabit({
          name: 'Habit name #1',
          description: 'Habit description #1',
        }),
        makeTestHabit({
          name: 'Habit name #2',
          description: 'Habit description #2',
        }),
      ],
    }));
    const { getByText } = render(
      <TraitsProvider>
        <HabitsProvider>
          <HabitsPage />
        </HabitsProvider>
      </TraitsProvider>
    );
    await waitFor(() => {
      expect(getByText('Your habits'));
      expect(getByText('Habit name #1'));
      expect(getByText('Habit name #2'));
      expect(getByText('Habit description #1'));
      expect(getByText('Habit description #2'));
    });
  });

  it('should open edit dialog on edit icon button click', async () => {
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits: [
        makeTestHabit({
          id: 42,
          name: 'Habit name #1',
          description: 'Habit description #1',
        }),
        makeTestHabit({
          name: 'Habit name #2',
          description: 'Habit description #2',
        }),
      ],
    }));
    const { queryByRole, getByRole, getByTestId } = render(
      <TraitsProvider>
        <HabitsProvider>
          <HabitsPage />
        </HabitsProvider>
      </TraitsProvider>
    );
    expect(queryByRole('submit-edited-habit-button')).toBeNull();
    fireEvent.click(getByTestId('edit-habit-id-42-button'));
    expect(getByRole('submit-edited-habit-button')).toBeDefined();
  });

  it.skip('should open confirm dialog on remove icon button click', async () => {
    const { getByRole, getByTestId } = render(
      <TraitsProvider>
        <HabitsProvider>
          <HabitsPage />
        </HabitsProvider>
      </TraitsProvider>
    );
    fireEvent.click(getByTestId('delete-habit-id-2-button'));
    expect(getByRole('dialog')).toBeDefined();
    fireEvent.click(getByRole('confirm-dialog-cancel'));
  });

  it.skip('should remove habit on confirm', async () => {
    const mockRemoveHabit = jest.fn();
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits: [
        makeTestHabit({
          name: 'Habit name #1',
          description: 'Habit description #1',
        }),
        makeTestHabit({
          name: 'Habit name #2',
          description: 'Habit description #2',
        }),
      ],
      removeHabit: mockRemoveHabit,
    }));
    const { queryByRole, getByRole, getByTestId } = render(
      <TraitsProvider>
        <HabitsProvider>
          <HabitsPage />
        </HabitsProvider>
      </TraitsProvider>
    );
    expect(queryByRole('dialog')).toBeNull();
    fireEvent.click(getByTestId('delete-habit-id-2-button'));
    expect(getByRole('dialog')).toBeDefined();
    fireEvent.click(getByRole('confirm-dialog-confirm'));
    expect(mockRemoveHabit).toHaveBeenCalled();
  });
});
