import { getYearWeekNumberFromMonthWeek } from '@helpers';
import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import { Button } from '@nextui-org/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useCalendarGrid, useLocale } from 'react-aria';
import { useNavigate } from 'react-router-dom';
import { type CalendarState } from 'react-stately';

import type { CellPosition, CellRangeStatus } from './CalendarCell';
import CalendarCell from './CalendarCell';

type CalendarGridProps = {
  state: CalendarState;
  onAddNote: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  onAddOccurrence: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
  activeMonthLabel: string;
  activeYear: number;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarGrid = ({
  state,
  onAddNote,
  onAddOccurrence,
  activeMonthLabel,
  activeYear,
}: CalendarGridProps) => {
  const navigate = useNavigate();
  const { gridProps } = useCalendarGrid({}, state);
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const { month: activeMonth } = state.visibleRange.start;

  const handleWeekClick = (startDate: CalendarDate | null) => {
    if (!startDate) {
      return;
    }

    navigate('/calendar/week', {
      state: {
        startDate: new Date(startDate.year, startDate.month - 1, startDate.day),
      },
    });
  };

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
    <div {...gridProps} className="flex flex-1 flex-col gap-0 lg:gap-4">
      <div className="mb-1 flex">
        {[...Array(7)].map((_, index) => {
          return (
            <div
              key={index}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <p className="font-bold">{WEEK_DAYS[index]}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="flex flex-1 flex-col"
          key={activeMonthLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {weekIndexes.map((weekIndex) => {
            const { week } = getYearWeekNumberFromMonthWeek(
              activeMonthLabel,
              activeYear,
              weekIndex
            );
            const dates = state.getDatesInWeek(weekIndex);

            return (
              <div
                key={weekIndex}
                className="group relative flex items-end gap-1 md:gap-2"
              >
                <Button
                  className={clsx(
                    'absolute -left-[24px] bottom-0 h-[107px] w-[20px] min-w-fit p-0 md:-left-[48px] md:w-[40px]'
                  )}
                  variant="light"
                  onClick={() => handleWeekClick(dates[0])}
                >
                  {week}
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
                        (month < activeMonth ||
                          (month === 12 && activeMonth === 1)) &&
                        month !== 1
                          ? 'below-range'
                          : month > activeMonth ||
                              (month === 1 && activeMonth === 12)
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
                          onAddOccurrence={onAddOccurrence}
                          onAddNote={onAddNote}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarGrid;
