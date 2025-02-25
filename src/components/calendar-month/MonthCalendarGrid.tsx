import { getMonthIndex, getYearWeekNumberFromMonthWeek } from '@helpers';
import { Button } from '@heroui/react';
import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import { isTruthy } from '@utils';
import clsx from 'clsx';
import { addMonths, isSameMonth } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useCalendarGrid, useLocale } from 'react-aria';
import { Link } from 'react-router-dom';
import { type CalendarState } from 'react-stately';

import type { CellPosition, CellRangeStatus } from './MonthCalendarCell';
import MonthCalendarCell from './MonthCalendarCell';

type CalendarGridProps = {
  state: CalendarState;
  onAddNote: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  onAddOccurrence: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
  onEditOccurrence: (occurrenceId: number) => void;
  activeMonthLabel: string;
  activeYear: number;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MonthCalendarGrid = ({
  state,
  onAddNote,
  onAddOccurrence,
  onEditOccurrence,
  activeMonthLabel,
  activeYear,
}: CalendarGridProps) => {
  const { gridProps } = useCalendarGrid({}, state);
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const visibleMonth = new Date(activeYear, getMonthIndex(activeMonthLabel), 1);

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
          transition={{ duration: 0.1 }}
        >
          {weekIndexes.map((weekIndex) => {
            const { week } = getYearWeekNumberFromMonthWeek(
              activeMonthLabel,
              activeYear,
              weekIndex
            );
            const dates = state.getDatesInWeek(weekIndex).filter(isTruthy);
            const [firstDate] = dates;

            return (
              <div
                key={weekIndex}
                className="group relative flex items-end gap-1 md:gap-2"
              >
                <Button
                  as={Link}
                  className={clsx(
                    'absolute -left-[24px] bottom-0 h-[107px] w-[20px] min-w-fit p-0 md:-left-[48px] md:w-[40px]'
                  )}
                  variant="light"
                  to={`/calendar/week/${firstDate.year}/${firstDate.month}/${firstDate.day}`}
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

                      const date = new Date(year, month - 1, day);
                      const prevMonth = addMonths(visibleMonth, -1);
                      const nextMonth = addMonths(visibleMonth, 1);

                      const rangeStatus: CellRangeStatus = isSameMonth(
                        date,
                        visibleMonth
                      )
                        ? 'in-range'
                        : isSameMonth(date, prevMonth)
                          ? 'below-range'
                          : isSameMonth(date, nextMonth)
                            ? 'above-range'
                            : '';

                      const [cellKey] = calendarDate.toString().split('T');

                      const position = getCellPosition(weekIndex, dayIndex);

                      return (
                        <MonthCalendarCell
                          key={cellKey}
                          date={calendarDate}
                          onAddOccurrence={() =>
                            onAddOccurrence(day, month, year)
                          }
                          onDayNoteClick={() => onAddNote(day, month, year)}
                          rangeStatus={rangeStatus}
                          position={position}
                          onEditOccurrence={onEditOccurrence}
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

export default MonthCalendarGrid;
