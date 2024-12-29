import { getYearWeekNumberFromMonthWeek } from '@helpers';
import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import { Button } from '@nextui-org/react';
import clsx from 'clsx';
import React, { type ForwardedRef } from 'react';
import { useLocale } from 'react-aria';
import { type CalendarState } from 'react-stately';

import CalendarCell from './CalendarCell';
import type { CellPosition, CellRangeStatus } from './CalendarCell';

type MonthProps = {
  state: CalendarState;
  onDayModalDialogOpen: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
  activeMonthLabel: string;
  activeYear: number;
};

const Month = (
  { state, onDayModalDialogOpen, activeMonthLabel, activeYear }: MonthProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const { month: activeMonth } = state.visibleRange.start;

  const getCellPosition = (
    weekIndex: number,
    dayIndex: number
  ): CellPosition => {
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
        const weekNum = getYearWeekNumberFromMonthWeek(
          activeMonthLabel,
          activeYear,
          weekIndex
        );

        return (
          <div key={weekIndex} className="group flex items-center gap-4">
            <Button
              className={clsx(
                'h-[110px] basis-[40px]',
                'hidden' // TODO: show the week number button, open weekly view (WIP) on click
              )}
              variant="ghost"
            >
              {weekNum}
            </Button>
            <div
              className={clsx(
                'flex h-[110px] w-full basis-full justify-between border-l-2 border-r-2 border-neutral-500 last-of-type:border-b-2 group-first-of-type:border-t-2 dark:border-neutral-400 lg:h-auto',
                weekIndex === 0 && 'rounded-t-lg',
                weekIndex === weeksInMonthCount - 1 && 'rounded-b-lg'
              )}
            >
              {state
                .getDatesInWeek(weekIndex)
                .map((calendarDate: CalendarDate | null, dayIndex) => {
                  if (!calendarDate) {
                    return null;
                  }

                  const { month, day, year } = calendarDate;

                  const rangeStatus: CellRangeStatus =
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
          </div>
        );
      })}
    </div>
  );
};

export default React.forwardRef(Month);
