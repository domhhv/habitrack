import { Provider as RollbarProvider } from '@rollbar/react';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import { useHabits } from '@hooks';
import { makeTestHabit } from '@tests';

import HabitsTable from './HabitsTable';

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
              <HabitsTable habitsStats={{}} />
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
});
