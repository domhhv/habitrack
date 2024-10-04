import { HabitsProvider, TraitsProvider, useHabits, useTraits } from '@context';
import type { Habit } from '@models';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import HabitsPage from './HabitsPage';

jest.mock('@context', () => ({
  TraitsProvider: jest.fn(({ children }) => children),
  HabitsProvider: jest.fn(({ children }) => children),
  useHabits: jest.fn().mockImplementation(() => ({
    habits: [],
    habitsMap: {},
    removeHabit: jest.fn(),
  })),
  useSnackbar: jest.fn().mockReturnValue({}),
  useTraits: jest.fn().mockReturnValue({
    traitsMap: {},
    traits: [],
    allTraits: [],
  }),
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
}));

jest.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useHabitIconUrl: jest.fn(),
  useHabitTraitChipColor: jest.fn(),
  useDocumentTitle: jest.fn(),
  useTextField: jest
    .fn()
    .mockReturnValue(['', jest.fn(), jest.fn(), jest.fn()]),
  useFileField: jest.fn().mockReturnValue([null, jest.fn(), jest.fn()]),
}));

describe(HabitsPage.name, () => {
  it('should display habits', async () => {
    const habits: Habit[] = [
      {
        id: 1,
        name: 'Habit name #1',
        description: 'Habit description #1',
        userId: 'uuid-42',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 1,
      },
      {
        id: 2,
        name: 'Habit name #2',
        description: 'Habit description #2',
        userId: 'uuid-43',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 2,
      },
    ];
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits,
      habitsMap: {
        1: habits[0],
        2: habits[1],
      },
      removeHabit: jest.fn(),
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
      expect(getByText('Count: 2'));
      expect(getByText('Habit name #1'));
      expect(getByText('Habit name #2'));
      expect(getByText('Habit description #1'));
      expect(getByText('Habit description #2'));
    });
  });

  it('should open edit dialog on edit icon button click', async () => {
    const habits: Habit[] = [
      {
        id: 1,
        name: 'Habit name #1',
        description: 'Habit description #1',
        userId: 'uuid-42',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 1,
      },
      {
        id: 2,
        name: 'Habit name #2',
        description: 'Habit description #2',
        userId: 'uuid-43',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 2,
      },
    ];
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits,
      habitsMap: {
        1: habits[0],
        2: habits[1],
      },
      removeHabit: jest.fn(),
    }));
    (useTraits as jest.Mock).mockImplementation(() => ({
      traitsMap: { 1: {}, 2: {} },
      allTraits: [],
    }));
    const { queryByRole, getByRole, getByTestId } = render(
      <TraitsProvider>
        <HabitsProvider>
          <HabitsPage />
        </HabitsProvider>
      </TraitsProvider>
    );
    expect(queryByRole('submit-edited-habit-button')).toBeNull();
    fireEvent.click(getByTestId('edit-habit-id-2-button'));
    expect(getByRole('submit-edited-habit-button')).toBeDefined();
  });

  it('should open confirm dialog on remove icon button click', async () => {
    const habits: Habit[] = [
      {
        id: 1,
        name: 'Habit name #1',
        description: 'Habit description #1',
        userId: 'uuid-42',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 1,
      },
      {
        id: 2,
        name: 'Habit name #2',
        description: 'Habit description #2',
        userId: 'uuid-43',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 2,
      },
    ];
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits,
      habitsMap: {
        1: habits[0],
        2: habits[1],
      },
      removeHabit: jest.fn(),
    }));
    (useTraits as jest.Mock).mockImplementation(() => ({
      traitsMap: { 1: {}, 2: {} },
      allTraits: [],
    }));
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

  it('should remove habit on confirm', async () => {
    const habits: Habit[] = [
      {
        id: 1,
        name: 'Habit name #1',
        description: 'Habit description #1',
        userId: 'uuid-42',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 1,
      },
      {
        id: 2,
        name: 'Habit name #2',
        description: 'Habit description #2',
        userId: 'uuid-43',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path-2',
        traitId: 2,
      },
    ];
    const mockRemoveHabit = jest.fn();
    (useHabits as jest.Mock).mockImplementation(() => ({
      habits,
      habitsMap: {
        1: habits[0],
        2: habits[1],
      },
      removeHabit: mockRemoveHabit,
    }));
    (useTraits as jest.Mock).mockImplementation(() => ({
      traitsMap: { 1: {}, 2: {} },
      allTraits: [],
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
