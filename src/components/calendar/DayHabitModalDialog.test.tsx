import { useOccurrences } from '@context';
import { useHabitsStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import { format } from 'date-fns';
import React from 'react';

import DayHabitModalDialog from './DayHabitModalDialog';

jest.mock('@context', () => ({
  useOccurrences: jest.fn(),
  useSnackbar: jest.fn().mockReturnValue({ showSnackbar: jest.fn() }),
}));

jest.mock('@stores', () => ({
  useHabitsStore: jest.fn(),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(),
}));

jest.mock('date-fns', () => ({
  format: jest.fn(),
}));

describe(DayHabitModalDialog.name, () => {
  const mockOnClose = jest.fn();
  const date = new Date(2021, 1, 1, 12);

  const props = {
    open: true,
    onClose: mockOnClose,
    date,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByText } = render(<DayHabitModalDialog {...props} />);
    expect(getByText('Add habit entries for 2021-01-01')).toBeInTheDocument();
  });

  it('should not render if date is null', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { container } = render(
      <DayHabitModalDialog {...props} date={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render if open is false', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { container } = render(
      <DayHabitModalDialog {...props} open={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render if date is null', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { container } = render(
      <DayHabitModalDialog {...props} date={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('if no habits are available, should show a message', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getAllByText } = render(<DayHabitModalDialog {...props} />);
    expect(getAllByText('No habits yet')).toHaveLength(2);
  });

  it('should render habit options', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByText } = render(<DayHabitModalDialog {...props} />);
    expect(getByText('Test Habit')).toBeInTheDocument();
  });

  it.skip('should select habit', async () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeTestHabit({ id: 42 })],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { container, getAllByText, getByTestId } = render(
      <DayHabitModalDialog {...props} />
    );
    fireEvent.click(getByTestId('habit-select'));
    fireEvent.click(getAllByText('Test Habit')[1]);
    await waitFor(() => {
      const elem = container.querySelector('span[data-slot="value"]');
      expect(elem).toHaveTextContent('Test Habit');
    });
  });

  it('on close, should call onClose', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByRole } = render(<DayHabitModalDialog {...props} />);
    fireEvent.click(getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it.skip('on close, should unselect habit', () => {
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByRole, getByText } = render(<DayHabitModalDialog {...props} />);
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
    (useHabitsStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue(date.toISOString().split('T')[0]);
    const mockAddOccurrence = jest.fn();
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: mockAddOccurrence,
      addingOccurrence: false,
    });
    const { getByRole, getByText } = render(<DayHabitModalDialog {...props} />);
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
