import { type CalendarDate } from '@internationalized/date';
import React, { type ForwardedRef } from 'react';
import { type CalendarState } from 'react-stately';

import CalendarCell from './CalendarCell';

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
    <div ref={ref} className="flex flex-1 flex-col">
      {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
        <div
          key={weekIndex}
          className="flex h-[110px] justify-between border-l-3 border-r-3 border-t-3 border-neutral-500 last-of-type:border-b-3 dark:border-neutral-400 lg:h-auto"
        >
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
        </div>
      ))}
    </div>
  );
};

export default React.forwardRef(Month);
