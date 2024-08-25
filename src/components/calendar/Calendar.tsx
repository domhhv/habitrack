import { CalendarDate } from '@internationalized/date';
import { capitalizeFirstLetter } from '@utils';
import React from 'react';
import { type AriaButtonProps, useCalendar } from 'react-aria';
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

  React.useEffect(() => {
    document.title = `${activeMonthLabel.slice(
      0,
      3
    )} ${activeYear} | Habilify Calendar`;
  }, [activeMonthLabel, activeYear]);

  const setFocusedDate = (year: number, month: number, day: number) => {
    const nextFocusedDate = new CalendarDate(year, month, day);
    state.setFocusedDate(nextFocusedDate);
  };

  const navigateToMonth = (month: number) => {
    const { year, day } = state.focusedDate;
    setFocusedDate(year, month, day);
  };

  const navigateToYear = (year: number) => {
    const { month, day } = state.focusedDate;
    setFocusedDate(year, month, day);
  };

  const resetFocusedDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    setFocusedDate(year, month + 1, day);
  };

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
          onNavigateToMonth={navigateToMonth}
          onNavigateToYear={navigateToYear}
          onResetFocusedDate={resetFocusedDate}
        />
        <CalendarGrid state={state} weeksInMonth={weeksInMonth} />
      </StyledCalendarContainerDiv>
    </StyledCalendarBackgroundDiv>
  );
};

export default Calendar;
