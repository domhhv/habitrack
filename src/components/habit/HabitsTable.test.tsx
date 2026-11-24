import { Provider as RollbarProvider } from '@rollbar/react';
import { act, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import { useHabits } from '@hooks';
import { useConfirmationActions } from '@stores';
import { makeTestHabit } from '@tests';

import HabitsTable from './HabitsTable';
import type { HabitsStats } from './HabitStatsCell';

vi.mock(import('@rollbar/react'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    error: vi.fn(),
  };
});

vi.mock('@services', () => {
  return {
    getPublicUrl: vi.fn(),
    StorageBuckets: {
      HABIT_ICONS: 'habit-icons',
    },
  };
});

vi.mock('@stores', () => {
  return {
    useConfirmationActions: vi.fn().mockReturnValue({
      askConfirmation: vi.fn().mockResolvedValue(false),
    }),
  };
});

vi.mock('@hooks', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    useFileField: vi.fn().mockReturnValue([null, vi.fn(), vi.fn()]),
    useHabits: vi.fn(),
    useTextField: vi.fn().mockReturnValue(['', vi.fn(), vi.fn(), vi.fn()]),
    useTraits: vi.fn().mockReturnValue({}),
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
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
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
    });
    const Stub = createRoutesStub([
      {
        path: '/habits',
        Component: () => {
          return (
            <RollbarProvider config={{}}>
              <HabitsTable habitsStats={Promise.resolve({})} />
            </RollbarProvider>
          );
        },
      },
    ]);
    const { getAllByLabelText, getByText } = render(
      <Stub initialEntries={['/habits']} />
    );
    await waitFor(() => {
      expect(getByText('Habit name #1'));
      expect(getByText('Habit name #2'));
      expect(getByText('Habit description #1'));
      expect(getByText('Habit description #2'));

      const deleteButtons = getAllByLabelText(/^Delete habit:/i);

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

  it('shows the habit stats once they stream in', async () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      'habit-1': makeTestHabit({ id: 'habit-1', name: 'Habit name #1' }),
    });
    const { promise, resolve } = Promise.withResolvers<HabitsStats>();
    const Stub = createRoutesStub([
      {
        path: '/habits',
        Component: () => {
          return (
            <RollbarProvider config={{}}>
              <HabitsTable habitsStats={promise} />
            </RollbarProvider>
          );
        },
      },
    ]);
    const { getByText, queryByText } = await act(async () => {
      return render(<Stub initialEntries={['/habits']} />);
    });

    await waitFor(() => {
      expect(getByText('Habit name #1'));
    });
    expect(queryByText('7')).toBeNull();

    await act(async () => {
      resolve({
        'habit-1': {
          habitId: 'habit-1',
          lastEntryAt: null,
          longestStreakEnd: null,
          longestStreakLength: null,
          longestStreakStart: null,
          totalEntries: 7,
        },
      });
      await promise;
    });

    expect(getByText('7'));
  });

  it('hides a habit while its deletion is pending', async () => {
    vi.mocked(useConfirmationActions).mockReturnValue({
      askConfirmation: vi.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useConfirmationActions>);
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      'habit-1': makeTestHabit({ id: 'habit-1', name: 'Habit name #1' }),
      'habit-2': makeTestHabit({ id: 'habit-2', name: 'Habit name #2' }),
    });
    const Stub = createRoutesStub([
      {
        path: '/habits',
        Component: () => {
          return (
            <RollbarProvider config={{}}>
              <HabitsTable habitsStats={Promise.resolve({})} />
            </RollbarProvider>
          );
        },
      },
      {
        path: '/habits/:habitId',
        action: () => {
          return new Promise(() => {});
        },
      },
    ]);
    const { findByLabelText, getByText, queryByText } = render(
      <Stub initialEntries={['/habits']} />
    );

    fireEvent.click(await findByLabelText('Delete habit: Habit name #1'));

    await waitFor(() => {
      expect(queryByText('Habit name #1')).toBeNull();
    });
    expect(getByText('Habit name #2')).toBeTruthy();
  });
});
