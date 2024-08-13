import { useHabits, useOccurrences, useTraits } from '@context';
import { useUser } from '@supabase/auth-helpers-react';
import { fireEvent, render } from '@testing-library/react';
import { makeTestHabit } from '@tests';
import { format } from 'date-fns';
import React from 'react';

import DayHabitModalDialog from './DayHabitModalDialog';

jest.mock('@context', () => ({
  useOccurrences: jest.fn(),
  useHabits: jest.fn(),
  useTraits: jest.fn(),
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
    (useHabits as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByText } = render(<DayHabitModalDialog {...props} />);
    expect(getByText('Add habits for 2021-01-01')).toBeInTheDocument();
    expect(
      getByText('Select from the habits provided below')
    ).toBeInTheDocument();
  });

  it('should not render if date is null', () => {
    (useHabits as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
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
    (useHabits as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
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
    (useHabits as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
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
    (useHabits as jest.Mock).mockReturnValue({ habits: [] });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getAllByText, getByText } = render(
      <DayHabitModalDialog {...props} />
    );
    expect(getAllByText('No habits found')).toHaveLength(2);
    expect(getByText('Add a habit or some first')).toBeInTheDocument();
  });

  it('should render habit options', () => {
    (useHabits as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByText } = render(<DayHabitModalDialog {...props} />);
    expect(getByText('Test Habit')).toBeInTheDocument();
  });

  it('should select habit', () => {
    (useHabits as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
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
  });

  it('on close, should call onClose', () => {
    (useHabits as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
    (useOccurrences as jest.Mock).mockReturnValue({
      addOccurrence: jest.fn(),
      addingOccurrence: false,
    });
    const { getByRole } = render(<DayHabitModalDialog {...props} />);
    fireEvent.click(getByRole('add-occurrence-modal-close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('on close, should unselect habit', () => {
    (useHabits as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue('2021-01-01');
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
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

  it('on submit, should call addOccurrence with proper arguments', () => {
    (useHabits as jest.Mock).mockReturnValue({
      habits: [makeTestHabit()],
    });
    (useUser as jest.Mock).mockReturnValue({ id: '1' });
    (format as jest.Mock).mockReturnValue(date.toISOString().split('T')[0]);
    (useTraits as jest.Mock).mockReturnValue({ traitsMap: {} });
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
