import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import clsx from 'clsx';
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

  const getCellPosition = (weekIndex: number, dayIndex: number) => {
    if (weekIndex === 0 && dayIndex === 0) {
      return 'top-left';
    }

    if (weekIndex === 0 && dayIndex === 6) {
      return 'top-right';
    }

    if (weekIndex === weeksInMonthCount - 1 && dayIndex === 0) {
      return 'bottom-left';
    }

    if (weekIndex === weeksInMonthCount - 1 && dayIndex === 6) {
      return 'bottom-right';
    }

    return '';
  };

  return (
    <div ref={ref} className="flex flex-1 flex-col">
      {weekIndexes.map((weekIndex) => {
        const weekContainerClassName = clsx(
          'flex h-[110px] justify-between border-l-2 border-r-2 border-t-2 border-neutral-500 last-of-type:border-b-2 dark:border-neutral-400 lg:h-auto',
          weekIndex === 0 && 'rounded-t-lg',
          weekIndex === weeksInMonthCount - 1 && 'rounded-b-lg'
        );

        return (
          <div key={weekIndex} className={weekContainerClassName}>
            {state
              .getDatesInWeek(weekIndex)
              .map((calendarDate: CalendarDate | null, dayIndex) => {
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

                const [cellKey] = calendarDate.toString().split('T');

                const position = getCellPosition(weekIndex, dayIndex);

                return (
                  <CalendarCell
                    key={cellKey}
                    dateNumber={day}
                    monthNumber={month}
                    fullYear={year}
                    onClick={onDayModalDialogOpen}
                    rangeStatus={rangeStatus}
                    position={position}
                    onNavigateBack={state.focusPreviousPage}
                    onNavigateForward={state.focusNextPage}
                  />
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default React.forwardRef(Month);
