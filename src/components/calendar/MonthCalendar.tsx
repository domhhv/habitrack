import {
  today,
  CalendarDate,
  startOfMonth,
  toCalendarDate,
} from '@internationalized/date';
import React from 'react';
import { useParams } from 'react-router';
import type { CalendarState } from 'react-stately';

import CalendarSidebar from './CalendarSidebar';
import MonthCalendarGrid from './MonthCalendarGrid';

type MonthCalendarProps = {
  state: CalendarState;
};

const MonthCalendar = ({ state }: MonthCalendarProps) => {
  const params = useParams();

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
