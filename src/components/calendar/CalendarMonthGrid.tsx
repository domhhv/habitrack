import { CalendarDate } from '@internationalized/date';
import type { OccurrencesDateMap } from '@models';
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
  occurrencesByDate: OccurrencesDateMap;
};

const Month = (
  { weeksInMonth, state, onDayModalDialogOpen, occurrencesByDate }: MonthProps,
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

              const day = calendarDate.toString().split('T')[0];

              return (
                <CalendarCell
                  key={day}
                  dateNumber={calendarDate.day}
                  monthIndex={calendarDate.month}
                  fullYear={calendarDate.year}
                  onClick={onDayModalDialogOpen}
                  occurrences={occurrencesByDate[day] || []}
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
