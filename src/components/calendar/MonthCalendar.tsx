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

import CalendarSidebar from './CalendarSidebar';
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
    <div className="flex w-full flex-1 flex-col gap-2 md:gap-10 lg:flex-row-reverse">
      <CalendarSidebar
        kind="month"
        focusedDate={state.focusedDate}
        className="flex gap-2 pt-4 pb-2 lg:w-84 lg:py-8"
      />
      <MonthCalendarGrid state={state} />
    </div>
  );
};

export default MonthCalendar;
