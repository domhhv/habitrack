import { HabitsProvider, OccurrencesProvider } from '@context';
import { render } from '@testing-library/react';
import React from 'react';

import CalendarHeader, { type CalendarHeaderProps } from './CalendarHeader';

describe(CalendarHeader.name, () => {
  const props: CalendarHeaderProps = {
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
    const { getByText } = render(
      <HabitsProvider>
        <OccurrencesProvider>
          <CalendarHeader {...props} />
        </OccurrencesProvider>
      </HabitsProvider>
    );
    expect(getByText('January 2022')).toBeInTheDocument();
  });

  it.skip('should disable previous button', () => {
    const { getByRole } = render(
      <HabitsProvider>
        <OccurrencesProvider>
          <CalendarHeader
            {...props}
            prevButtonProps={{ ...props.prevButtonProps, disabled: true }}
          />
        </OccurrencesProvider>
      </HabitsProvider>
    );
    expect(getByRole('navigate-back')).toBeDisabled();
  });

  it.skip('should disable next button', () => {
    const { getByRole } = render(
      <HabitsProvider>
        <OccurrencesProvider>
          <CalendarHeader
            {...props}
            nextButtonProps={{ ...props.nextButtonProps, disabled: true }}
          />
        </OccurrencesProvider>
      </HabitsProvider>
    );
    expect(getByRole('navigate-forward')).toBeDisabled();
  });

  it.skip('should call onNavigateBack', () => {
    const { getByRole } = render(
      <HabitsProvider>
        <OccurrencesProvider>
          <CalendarHeader {...props} />
        </OccurrencesProvider>
      </HabitsProvider>
    );
    getByRole('navigate-back').click();
    expect(props.onNavigateBack).toHaveBeenCalled();
  });

  it.skip('should call onNavigateForward', () => {
    const { getByRole } = render(
      <HabitsProvider>
        <OccurrencesProvider>
          <CalendarHeader {...props} />
        </OccurrencesProvider>
      </HabitsProvider>
    );
    getByRole('navigate-forward').click();
    expect(props.onNavigateForward).toHaveBeenCalled();
  });
});
