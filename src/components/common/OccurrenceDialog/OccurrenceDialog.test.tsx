import { useUser } from '@hooks';
import { useHabits, useNoteActions, useOccurrenceActions } from '@stores';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import { format } from 'date-fns';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import OccurrenceDialog from './OccurrenceDialog';

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

  it.skip('should select habit', async () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    const { container, getAllByText, getByTestId } = render(
      <OccurrenceDialog {...props} />
    );
    fireEvent.click(getByTestId('habit-select'));
    fireEvent.click(getAllByText('Test Habit')[1]);
    await waitFor(() => {
      const elem = container.querySelector('span[data-slot="value"]');
      expect(elem).toHaveTextContent('Test Habit');
    });
  });

  it('on close, should call onClose', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useNoteActions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    const { getByRole } = render(<OccurrenceDialog {...props} />);
    fireEvent.click(getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it.skip('on close, should unselect habit', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    const { getByRole, getByText } = render(<OccurrenceDialog {...props} />);
    fireEvent.click(getByRole('habit-select'));
    fireEvent.click(getByText('Test Habit'));
    expect(
      getByRole('habit-select').querySelector('[role="combobox"]')
    ).toHaveTextContent('Test Habit');
    fireEvent.click(getByRole('add-occurrence-modal-close'));
    expect(
      getByRole('habit-select').querySelector('[role="combobox"]')
    ).toHaveTextContent('Select Habit');
  });

  it.skip('on submit, should call addOccurrence with proper arguments', () => {
    (useHabits as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue(
      newOccurrenceDate.toISOString().split('T')[0]
    );
    const mockAddOccurrence = vi.fn();
    (
      useOccurrenceActions as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      addOccurrence: mockAddOccurrence,
    });
    const { getByRole, getByText } = render(<OccurrenceDialog {...props} />);
    fireEvent.click(getByRole('habit-select'));
    fireEvent.click(getByText('Test Habit'));
    expect(
      getByRole('habit-select').querySelector('[role="combobox"]')
    ).toHaveTextContent('Test Habit');
    fireEvent.click(getByText('Submit'));
    expect(mockAddOccurrence).toHaveBeenCalledWith({
      day: '2021-02-01',
      timestamp: +newOccurrenceDate,
      habitId: 1,
      userId: '1',
      time: null,
    });
  });
});
