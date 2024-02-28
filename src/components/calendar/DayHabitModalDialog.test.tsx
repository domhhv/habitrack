import { useHabits, useOccurrences, useTraits } from '@context';
import { useUser } from '@supabase/auth-helpers-react';
import { render } from '@testing-library/react';
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
  const props = {
    open: true,
    onClose: jest.fn(),
    date: new Date(),
  };

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
    const { container } = render(
      <DayHabitModalDialog {...props} date={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render if open is false', () => {
    const { container } = render(
      <DayHabitModalDialog {...props} open={false} />
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
    const { getAllByText } = render(<DayHabitModalDialog {...props} />);
    expect(getAllByText('No habits found')).toHaveLength(2);
  });
});
