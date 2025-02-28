import { useUser } from '@hooks';
import { useHabitsStore, useNotesStore, useOccurrencesStore } from '@stores';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import { format } from 'date-fns';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import OccurrenceDialog from './OccurrenceDialog';

vi.mock('@stores', () => ({
  useHabitsStore: vi.fn(),
  useOccurrencesStore: vi.fn().mockReturnValue({
    occurrences: [],
  }),
  useNotesStore: vi.fn(),
}));

vi.mock('@hooks', () => ({
  useUser: vi.fn(),
}));

vi.mock('date-fns', () => ({
  isYesterday: vi.fn(),
  isToday: vi.fn(),
  isFuture: vi.fn(),
  format: vi.fn(),
}));

describe(OccurrenceDialog.name, () => {
  const mockOnClose = vi.fn();
  const date = new Date(2021, 1, 1, 12);

  const props = {
    isOpen: true,
    onClose: mockOnClose,
    date,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [],
    });
    (useNotesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
      addingNote: false,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: vi.fn(),
      addingOccurrence: false,
    });
    const { getByText } = render(
      <BrowserRouter>
        <OccurrenceDialog {...props} />
      </BrowserRouter>
    );
    expect(getByText('Add habit entry for 2021-01-01')).toBeInTheDocument();
  });

  it('if no habits are available, should show a message', () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [],
    });
    (useNotesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
      addingNote: false,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: vi.fn(),
      addingOccurrence: false,
    });
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
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useNotesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      occurrences: [],
      addNote: vi.fn(),
      addingNote: false,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: vi.fn(),
      addingOccurrence: false,
    });
    const { getByText } = render(<OccurrenceDialog {...props} />);
    expect(getByText('Test Habit')).toBeInTheDocument();
  });

  it.skip('should select habit', async () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [makeTestHabit({ id: 42 })],
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: vi.fn(),
      addingOccurrence: false,
    });
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
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useNotesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addNote: vi.fn(),
      addingNote: false,
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: vi.fn(),
      addingOccurrence: false,
    });
    const { getByRole } = render(<OccurrenceDialog {...props} />);
    fireEvent.click(getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it.skip('on close, should unselect habit', () => {
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue('2021-01-01');
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: vi.fn(),
      addingOccurrence: false,
    });
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
    (useHabitsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });
    (format as ReturnType<typeof vi.fn>).mockReturnValue(
      date.toISOString().split('T')[0]
    );
    const mockAddOccurrence = vi.fn();
    (
      useOccurrencesStore as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      occurrences: [],
      addOccurrence: mockAddOccurrence,
      addingOccurrence: false,
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
      timestamp: +date,
      habitId: 1,
      userId: '1',
      time: null,
    });
  });
});
