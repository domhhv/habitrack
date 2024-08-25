import { type CalendarDate } from '@internationalized/date';
import React, { type ForwardedRef } from 'react';
import { type CalendarState } from 'react-stately';

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
};

const Month = (
  { weeksInMonth, state, onDayModalDialogOpen }: MonthProps,
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

export default React.forwardRef(Month);
