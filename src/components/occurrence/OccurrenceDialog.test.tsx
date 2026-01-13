import { CalendarDate } from '@internationalized/date';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { I18nProvider } from 'react-aria';
import { BrowserRouter } from 'react-router';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useUser, useHabits, useNoteActions } from '@stores';
import { makeTestHabit } from '@tests';

import OccurrenceDialog from './OccurrenceDialog';

Object.defineProperty(window, 'DataTransfer', {
  writable: true,
  value: class {
    files = null;
    items = {
      add: () => {},
    };
  },
});

vi.mock('@services', () => {
  return {
    getPublicUrl: vi
      .fn()
      .mockReturnValue('https://i.ibb.co/vvgw7bx/habitrack-logo.png'),
  };
});

vi.mock('@stores', () => {
  return {
    useHabits: vi.fn(),
    useNoteActions: vi.fn(),
    useOccurrences: vi.fn().mockReturnValue([]),
    useUser: vi.fn(),
    useOccurrenceActions: vi.fn().mockReturnValue({
      addOccurrence: vi.fn(),
    }),
  };
});

vi.mock('@hooks', () => {
  return {
    useTextField: vi.fn().mockReturnValue(['', vi.fn(), vi.fn()]),
    useScreenWidth: vi.fn().mockReturnValue({
      isDesktop: true,
      isMobile: false,
      isTablet: false,
      screenWidth: 1400,
    }),
  };
});

describe(OccurrenceDialog.name, () => {
  const mockOnClose = vi.fn();
  const newOccurrenceDate = new CalendarDate(2021, 1, 1);

  const props = {
    isOpen: true,
    newOccurrenceDate,
    onClose: mockOnClose,
    timeZone: 'America/New_York',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({});
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    const { getByText } = render(
      <BrowserRouter>
        <I18nProvider locale="en-US">
          <OccurrenceDialog {...props} />
        </I18nProvider>
      </BrowserRouter>
    );
    expect(
      getByText('Add habit entry for January 1, 2021')
    ).toBeInTheDocument();
  });

  it('if no habits are available, should show a message', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({});
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    const { getAllByText } = render(
      <BrowserRouter>
        <OccurrenceDialog {...props} />
      </BrowserRouter>
    );
    expect(
      getAllByText('No habits yet. Create a habit to get started.')[0]
    ).toBeInTheDocument();
  });

  it('should render habit options', () => {
    const habitId = crypto.randomUUID();
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      [habitId]: makeTestHabit({ id: habitId }),
    });
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    const { getByText } = render(<OccurrenceDialog {...props} />);
    expect(getByText('Test Habit')).toBeInTheDocument();
  });

  it('on close, should call onClose', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({});
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    const { getByRole } = render(
      <BrowserRouter>
        <OccurrenceDialog {...props} />
      </BrowserRouter>
    );
    fireEvent.click(getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
