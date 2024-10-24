import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import React, { type ForwardedRef } from 'react';
import { useLocale } from 'react-aria';
import { type CalendarState } from 'react-stately';

import CalendarCell from './CalendarCell';

type MonthProps = {
  state: CalendarState;
  onDayModalDialogOpen: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
};

const Month = (
  { state, onDayModalDialogOpen }: MonthProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const { month: activeMonth } = state.visibleRange.start;

  return (
    <div ref={ref} className="flex flex-1 flex-col">
      {weekIndexes.map((weekIndex) => (
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

              const { month, day, year } = calendarDate;

              const rangeStatus =
                month < activeMonth
                  ? 'below-range'
                  : month > activeMonth
                    ? 'above-range'
                    : 'in-range';

              const [dayKey] = calendarDate.toString().split('T');

              return (
                <CalendarCell
                  key={dayKey}
                  dateNumber={day}
                  monthIndex={month}
                  fullYear={year}
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
