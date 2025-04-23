import { cn, Button, Tooltip } from '@heroui/react';
import { getWeeksInMonth, type CalendarDate } from '@internationalized/date';
import { endOfDay, addMonths, startOfDay, isSameMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useLocale, useCalendarGrid } from 'react-aria';
import { Link } from 'react-router';
import { type CalendarState } from 'react-stately';

import { getIsoWeek } from '@helpers';
import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { isTruthy, getMonthIndex } from '@utils';

import type { CellPosition, CellRangeStatus } from './MonthCalendarCell';
import MonthCalendarCell from './MonthCalendarCell';

type CalendarGridProps = {
  activeMonthLabel: string;
  activeYear: number;
  occurrences: Occurrence[];
  state: CalendarState;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MonthCalendarGrid = ({
  activeMonthLabel,
  activeYear,
  occurrences,
  state,
}: CalendarGridProps) => {
  const { gridProps } = useCalendarGrid({}, state);
  const { isDesktop } = useScreenWidth();
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
          exit={{ opacity: 0 }}
          key={activeMonthLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="flex flex-1 flex-col"
        >
          {weekIndexes.map((weekIndex) => {
            const [{ day, month, year }] = state
              .getDatesInWeek(weekIndex)
              .filter(isTruthy);

            return (
              <div
                key={weekIndex}
                className="group relative flex items-end gap-1 md:gap-2"
              >
                <Tooltip content="Go to this week">
                  <Button
                    as={Link}
                    variant="ghost"
                    radius={isDesktop ? 'md' : 'sm'}
                    to={`/calendar/week/${year}/${month}/${day}`}
                    className={cn(
                      'absolute -left-7 top-0 h-[32px] w-6 min-w-fit p-0 lg:-left-12 lg:h-[37px] lg:w-10',
                      weekIndex === 0 && 'top-0.5'
                    )}
                  >
                    {getIsoWeek(weekIndex, activeMonthLabel, activeYear)}
                  </Button>
                </Tooltip>
                <div
                  className={cn(
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

                      const { day, month, year } = calendarDate;

                      const date = new Date(year, month - 1, day);
                      const prevMonth = addMonths(visibleMonth, -1);
                      const nextMonth = addMonths(visibleMonth, 1);
                      const dayStart = startOfDay(date);
                      const dayEnd = endOfDay(date);

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
                          date={date}
                          key={cellKey}
                          position={position}
                          rangeStatus={rangeStatus}
                          occurrences={occurrences.filter((occurrence) => {
                            return (
                              occurrence.timestamp >= +dayStart &&
                              occurrence.timestamp <= +dayEnd
                            );
                          })}
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
