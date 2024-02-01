import { CalendarEvent } from '@context';
import { CalendarDate } from '@internationalized/date';
import { motion } from 'framer-motion';
import React, { type ForwardedRef } from 'react';
import { CalendarState } from 'react-stately';

import CalendarCell from './CalendarCell';
import { StyledCalendarMonthGrid, StyledCalendarWeekRow } from './styled';

type MonthProps = {
  weeksInMonth: number;
  state: CalendarState;
  onDayModalDialogOpen: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
  calendarEventsByDate: Record<string, CalendarEvent[]>;
};

const Month = (
  {
    weeksInMonth,
    state,
    onDayModalDialogOpen,
    calendarEventsByDate,
  }: MonthProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  return (
    <StyledCalendarMonthGrid ref={ref}>
      {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
        <StyledCalendarWeekRow key={weekIndex}>
          {state
            .getDatesInWeek(weekIndex)
            .map((calendarDate: CalendarDate | null) => {
              if (!calendarDate) {
                return null;
              }

              const rangeStatus =
                calendarDate.month < state.visibleRange.start.month
                  ? 'below-range'
                  : calendarDate.month > state.visibleRange.start.month
                    ? 'above-range'
                    : 'in-range';

              return (
                <CalendarCell
                  key={`${calendarDate.month}-${calendarDate.day}-${calendarDate.year}`}
                  dateNumber={calendarDate.day}
                  monthIndex={calendarDate.month}
                  fullYear={calendarDate.year}
                  onClick={onDayModalDialogOpen}
                  events={
                    calendarEventsByDate[
                      `${calendarDate.year}-${calendarDate.month}-${calendarDate.day}`
                    ] || []
                  }
                  rangeStatus={rangeStatus}
                  onNavigateBack={state.focusPreviousPage}
                  onNavigateForward={state.focusNextPage}
                />
              );
            })}
        </StyledCalendarWeekRow>
      ))}
    </StyledCalendarMonthGrid>
  );
};

export default motion(React.forwardRef(Month));