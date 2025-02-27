import { useHabitsStore } from '@stores';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import HabitsPage from './HabitsPage';

vi.mock('@services', () => ({
  StorageBuckets: {
    HABIT_ICONS: 'habit-icons',
  },
  listHabits: vi.fn().mockReturnValue(() => []),
  getLatestHabitOccurrenceTimestamp: vi.fn().mockResolvedValue(0),
  getLongestHabitStreak: vi.fn().mockResolvedValue(0),
  getHabitTotalEntries: vi.fn().mockResolvedValue(0),
}));

vi.mock('@stores', () => ({
  useHabitsStore: vi.fn(),
  useTraitsStore: vi.fn().mockReturnValue({
    traits: [],
  }),
  useOccurrencesStore: vi.fn().mockReturnValue({
    removeOccurrencesByHabitId: vi.fn(),
  }),
  useNotesStore: vi.fn().mockReturnValue({
    addingNote: false,
    addNote: vi.fn(),
  }),
}));

vi.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useUser: vi
    .fn()
    .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
  useDocumentTitle: vi.fn(),
  useTextField: vi.fn().mockReturnValue(['', vi.fn(), vi.fn(), vi.fn()]),
  useFileField: vi.fn().mockReturnValue([null, vi.fn(), vi.fn()]),
  useScreenWidth: vi.fn().mockReturnValue({
    screenWidth: 1400,
    isMobile: false,
    isDesktop: true,
  }),
}));

describe(HabitsPage.name, () => {
  it('should display habits', async () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
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
      })
    );
    const { getByText } = render(<HabitsPage />);
    await waitFor(() => {
      expect(getByText('Your habits'));
      expect(getByText('Habit name #1'));
      expect(getByText('Habit name #2'));
      expect(getByText('Habit description #1'));
      expect(getByText('Habit description #2'));
    });
  });

  it('should open edit dialog on edit icon button click', async () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
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
      })
    );
    const { queryByRole, getByRole, getByTestId } = render(<HabitsPage />);
    expect(queryByRole('submit-edited-habit-button')).toBeNull();
    fireEvent.click(getByTestId('edit-habit-id-42-button'));
    expect(getByRole('submit-edited-habit-button')).toBeDefined();
  });

  it.skip('should open confirm dialog on remove icon button click', async () => {
    const { getByRole, getByTestId } = render(<HabitsPage />);
    fireEvent.click(getByTestId('delete-habit-id-2-button'));
    expect(getByRole('dialog')).toBeDefined();
    fireEvent.click(getByRole('confirm-dialog-cancel'));
  });

  it.skip('should remove habit on confirm', async () => {
    const mockRemoveHabit = vi.fn();
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
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
      })
    );
    const { queryByRole, getByRole, getByTestId } = render(<HabitsPage />);
    expect(queryByRole('dialog')).toBeNull();
    fireEvent.click(getByTestId('delete-habit-id-2-button'));
    expect(getByRole('dialog')).toBeDefined();
    fireEvent.click(getByRole('confirm-dialog-confirm'));
    expect(mockRemoveHabit).toHaveBeenCalled();
  });
});
