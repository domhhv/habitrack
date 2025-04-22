import { useUser } from '@hooks';
import { useHabits, useNoteActions } from '@stores';
import { fireEvent, render } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import { format } from 'date-fns';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

vi.mock('@stores', () => {
  return {
    useHabits: vi.fn(),
    useOccurrences: vi.fn().mockReturnValue([]),
    useOccurrenceActions: vi.fn().mockReturnValue({
      addOccurrence: vi.fn(),
    }),
    useNoteActions: vi.fn(),
  };
});

vi.mock('@hooks', () => {
  return {
    useUser: vi.fn(),
    useScreenWidth: vi.fn().mockReturnValue({
      screenWidth: 1400,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }),
  };
});

vi.mock('date-fns', () => {
  return {
    isYesterday: vi.fn(),
    isToday: vi.fn(),
    isFuture: vi.fn(),
    format: vi.fn(),
  };
});

describe(OccurrenceDialog.name, () => {
  const mockOnClose = vi.fn();
  const newOccurrenceDate = new Date(2021, 1, 1, 12);

  const props = {
    isOpen: true,
    onClose: mockOnClose,
    newOccurrenceDate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    const { getByText } = render(
      <BrowserRouter>
        <OccurrenceDialog {...props} />
      </BrowserRouter>
    );
    expect(getByText('Add habit entry for 2021-01-01')).toBeInTheDocument();
  });

  it('if no habits are available, should show a message', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
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
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      makeTestHabit(),
    ]);
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    const { getByText } = render(<OccurrenceDialog {...props} />);
    expect(getByText('Test Habit')).toBeInTheDocument();
  });

  it('on close, should call onClose', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    const { getByRole } = render(
      <BrowserRouter>
        <OccurrenceDialog {...props} />
      </BrowserRouter>
    );
    fireEvent.click(getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
