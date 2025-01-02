import { render } from '@testing-library/react';
import React from 'react';

import MonthCalendarHeader, {
  type MonthCalendarHeaderProps,
} from './MonthCalendarHeader';

describe(MonthCalendarHeader.name, () => {
  const props: MonthCalendarHeaderProps = {
    activeMonthLabel: 'January',
    activeYear: '2022',
    prevButtonProps: {
      disabled: false,
      'aria-label': 'Previous month',
    },
    nextButtonProps: {
      disabled: false,
      'aria-label': 'Next month',
    },
    onNavigateBack: jest.fn(),
    onNavigateForward: jest.fn(),
    onNavigateToMonth: jest.fn(),
    onNavigateToYear: jest.fn(),
    onResetFocusedDate: jest.fn(),
  };

  it.skip('should render month and year', () => {
    const { getByText } = render(<MonthCalendarHeader {...props} />);
    expect(getByText('January 2022')).toBeInTheDocument();
  });

  it.skip('should disable previous button', () => {
    const { getByRole } = render(
      <MonthCalendarHeader
        {...props}
        prevButtonProps={{ ...props.prevButtonProps, disabled: true }}
      />
    );
    expect(getByRole('navigate-back')).toBeDisabled();
  });

  it.skip('should disable next button', () => {
    const { getByRole } = render(
      <MonthCalendarHeader
        {...props}
        nextButtonProps={{ ...props.nextButtonProps, disabled: true }}
      />
    );
    expect(getByRole('navigate-forward')).toBeDisabled();
  });

  it.skip('should call onNavigateBack', () => {
    const { getByRole } = render(<MonthCalendarHeader {...props} />);
    getByRole('navigate-back').click();
    expect(props.onNavigateBack).toHaveBeenCalled();
  });

  it.skip('should call onNavigateForward', () => {
    const { getByRole } = render(<MonthCalendarHeader {...props} />);
    getByRole('navigate-forward').click();
    expect(props.onNavigateForward).toHaveBeenCalled();
  });
});
