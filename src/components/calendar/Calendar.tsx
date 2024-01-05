import { createCalendar } from '@internationalized/date';
import { styled } from '@mui/joy';
import React from 'react';
import { useCalendar, useLocale } from 'react-aria';
import { useCalendarState } from 'react-stately';

import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';

const StyledCalendarContainerDiv = styled('div')(({ theme }) => ({
  display: 'inline-block',
  margin: `${theme.spacing(2)} auto 0`,
}));

export default function Calendar() {
  const { locale } = useLocale();
  const state = useCalendarState({
    locale,
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar({}, state);

  const [activeMonthLabel, activeYear] = title.split(' ');

  return (
    <StyledCalendarContainerDiv {...calendarProps}>
      <CalendarHeader
        activeMonthLabel={activeMonthLabel}
        activeYear={activeYear}
        prevButtonProps={{
          'aria-label': prevButtonProps['aria-label'] || '',
          disabled: Boolean(prevButtonProps.isDisabled),
        }}
        nextButtonProps={{
          'aria-label': nextButtonProps['aria-label'] || '',
          disabled: Boolean(nextButtonProps.isDisabled),
        }}
        onNavigateBack={state.focusNextPage}
        onNavigateForward={state.focusNextPage}
      />
      <CalendarGrid state={state} />
    </StyledCalendarContainerDiv>
  );
}
