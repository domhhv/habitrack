import {
  today,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  CalendarDate,
  startOfMonth,
  toCalendarDate,
  toCalendarDateTime,
} from '@internationalized/date';
import React from 'react';
import { useLocale } from 'react-aria';
import { useParams } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useFirstDayOfWeek } from '@hooks';
import { useCalendarRangeChange } from '@stores';

import CalendarFilters from './CalendarFilters';
import CalendarNavigation from './CalendarNavigation';
import MonthCalendarGrid from './MonthCalendarGrid';

type MonthCalendarProps = {
  state: CalendarState;
};

const MonthCalendar = ({ state }: MonthCalendarProps) => {
  const changeCalendarRange = useCalendarRangeChange();
  const params = useParams();
  const { locale } = useLocale();
  const firstDayOfWeek = useFirstDayOfWeek();
  const [isFocusedDateInitialized, setIsFocusedDateInitialized] =
    React.useState(false);

  React.useEffect(() => {
    if (!isFocusedDateInitialized && state.focusedDate.day !== 1) {
      return;
    }

    const focusedDateTime = toCalendarDateTime(state.focusedDate);

    const rangeStart = startOfWeek(
      startOfMonth(focusedDateTime),
      locale,
      firstDayOfWeek
    );
    const rangeEnd = endOfWeek(
      endOfMonth(focusedDateTime),
      locale,
      firstDayOfWeek
    ).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    changeCalendarRange([rangeStart, rangeEnd]);
  }, [
    state.focusedDate,
    firstDayOfWeek,
    changeCalendarRange,
    locale,
    isFocusedDateInitialized,
  ]);

  React.useEffect(() => {
    const currentMonth = startOfMonth(today(state.timeZone));

    const {
      day = currentMonth.day,
      month = currentMonth.month,
      year = currentMonth.year,
    } = params;

    const paramsDate = new CalendarDate(
      Number(year),
      Number(month),
      Number(day)
    );

    if (state.focusedDate.toString() !== paramsDate.toString()) {
      state.setFocusedDate(toCalendarDate(paramsDate));
      setIsFocusedDateInitialized(true);
    }
  }, [params, state]);

  return (
    <>
      <div className="flex flex-col items-stretch justify-between gap-2 px-0 pt-2 md:pt-0 lg:flex-row lg:gap-0 lg:px-0">
        <CalendarNavigation focusedDate={state.focusedDate} />
        <CalendarFilters />
      </div>
      <MonthCalendarGrid state={state} />
    </>
  );
};

export default MonthCalendar;
