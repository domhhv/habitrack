import { capitalizeFirstLetter } from '@utils';
import React from 'react';
import { AriaButtonProps, useCalendar } from 'react-aria';
import { type CalendarState } from 'react-stately';

import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';
import {
  StyledCalendarBackgroundDiv,
  StyledCalendarContainerDiv,
} from './styled';

type CalendarProps = {
  state: CalendarState;
  weeksInMonth: number;
};

const Calendar = ({ weeksInMonth, state }: CalendarProps) => {
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar({}, state);

  const [activeMonthLabel, activeYear] = title.split(' ');

  const transformButtonProps = (
    buttonProps: Pick<AriaButtonProps<'button'>, 'isDisabled' | 'aria-label'>
  ) => ({
    'aria-label': buttonProps['aria-label'] || '',
    disabled: Boolean(buttonProps.isDisabled),
  });

  return (
    <StyledCalendarBackgroundDiv>
      <StyledCalendarContainerDiv {...calendarProps}>
        <CalendarHeader
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={activeYear}
          prevButtonProps={transformButtonProps(prevButtonProps)}
          nextButtonProps={transformButtonProps(nextButtonProps)}
          onNavigateBack={state.focusPreviousPage}
          onNavigateForward={state.focusNextPage}
        />
        <CalendarGrid state={state} weeksInMonth={weeksInMonth} />
      </StyledCalendarContainerDiv>
    </StyledCalendarBackgroundDiv>
  );
};

export default Calendar;
