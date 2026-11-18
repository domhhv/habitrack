import React from 'react';
import type { CalendarState } from 'react-stately';

import CalendarSidebar from './CalendarSidebar';
import MonthCalendarGrid from './MonthCalendarGrid';

type MonthCalendarProps = {
  state: CalendarState;
};

const MonthCalendar = ({ state }: MonthCalendarProps) => {
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
