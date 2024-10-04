import {
  HabitsProvider,
  OccurrencesProvider,
  SnackbarProvider,
  TraitsProvider,
} from '@context';
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
      <SnackbarProvider>
        <HabitsProvider>
          <TraitsProvider>
            <OccurrencesProvider rangeStart={0} rangeEnd={0}>
              <CalendarHeader {...props} />
            </OccurrencesProvider>
          </TraitsProvider>
        </HabitsProvider>
      </SnackbarProvider>
    );
    expect(getByText('January 2022')).toBeInTheDocument();
  });

  it.skip('should disable previous button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <HabitsProvider>
          <TraitsProvider>
            <OccurrencesProvider rangeStart={0} rangeEnd={0}>
              <CalendarHeader
                {...props}
                prevButtonProps={{ ...props.prevButtonProps, disabled: true }}
              />
            </OccurrencesProvider>
          </TraitsProvider>
        </HabitsProvider>
      </SnackbarProvider>
    );
    expect(getByRole('navigate-back')).toBeDisabled();
  });

  it.skip('should disable next button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <HabitsProvider>
          <TraitsProvider>
            <OccurrencesProvider rangeStart={0} rangeEnd={0}>
              <CalendarHeader
                {...props}
                nextButtonProps={{ ...props.nextButtonProps, disabled: true }}
              />
            </OccurrencesProvider>
          </TraitsProvider>
        </HabitsProvider>
      </SnackbarProvider>
    );
    expect(getByRole('navigate-forward')).toBeDisabled();
  });

  it.skip('should call onNavigateBack', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <HabitsProvider>
          <TraitsProvider>
            <OccurrencesProvider rangeStart={0} rangeEnd={0}>
              <CalendarHeader {...props} />
            </OccurrencesProvider>
          </TraitsProvider>
        </HabitsProvider>
      </SnackbarProvider>
    );
    getByRole('navigate-back').click();
    expect(props.onNavigateBack).toHaveBeenCalled();
  });

  it.skip('should call onNavigateForward', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <HabitsProvider>
          <TraitsProvider>
            <OccurrencesProvider rangeStart={0} rangeEnd={0}>
              <CalendarHeader {...props} />
            </OccurrencesProvider>
          </TraitsProvider>
        </HabitsProvider>
      </SnackbarProvider>
    );
    getByRole('navigate-forward').click();
    expect(props.onNavigateForward).toHaveBeenCalled();
  });
});
