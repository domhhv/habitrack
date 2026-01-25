import { cn, Button, Tooltip } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import {
  toZoned,
  parseAbsolute,
  getWeeksInMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import { NoteIcon, NotePencilIcon } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendarGrid } from 'react-aria';
import { Link } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import type { Occurrence } from '@models';
import { useWeekNotes, useNoteDrawerActions } from '@stores';
import { getISOWeek } from '@utils';

import type { CellPosition } from './MonthCalendarCell';
import MonthCalendarCell from './MonthCalendarCell';

type CalendarGridProps = {
  occurrences: Occurrence[];
  state: CalendarState;
};

const MonthCalendarGrid = ({ occurrences, state }: CalendarGridProps) => {
  const { firstDayOfWeek } = useFirstDayOfWeek();
  const { gridProps, weekDays } = useCalendarGrid(
    {
      firstDayOfWeek,
      weekdayStyle: 'short',
    },
    state
  );
  const { isDesktop } = useScreenWidth();
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(
    state.visibleRange.start,
    locale,
    firstDayOfWeek
  );
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const weekNotes = useWeekNotes();
  const { openNoteDrawer } = useNoteDrawerActions();

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
    <div {...gridProps} className="flex flex-1 flex-col gap-0 lg:gap-1">
      <div className="mb-1 flex">
        {weekDays.map((weekDay) => {
          return (
            <div
              key={weekDay}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <p className="font-bold">{capitalize(weekDay)}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="flex flex-1 flex-col"
          key={state.focusedDate.toString()}
        >
          {weekIndexes.map((weekIndex) => {
            const daysOfWeek = state
              .getDatesInWeek(weekIndex)
              .filter((value): value is CalendarDate => {
                return Boolean(value);
              });
            const [firstDayOfWeek] = daysOfWeek;
            const monday = daysOfWeek.find((d) => {
              return d.toDate(state.timeZone).getDay() === 1;
            });

            if (!monday) {
              return null;
            }

            const weekNote = weekNotes.find((note) => {
              return note.periodDate === monday.toString();
            });

            return (
              <div
                key={weekIndex}
                className="group relative flex items-end gap-1 md:gap-2"
              >
                <div
                  className={cn(
                    'absolute -top-1 -left-7 flex h-full flex-col lg:-left-9',
                    weekIndex === 0 ? 'gap-1 lg:gap-1.5' : 'gap-0.5 lg:gap-1'
                  )}
                >
                  <Tooltip closeDelay={0} content="Go to this week">
                    <Button
                      as={Link}
                      variant="ghost"
                      radius={isDesktop ? 'md' : 'sm'}
                      to={`/calendar/week/${firstDayOfWeek.year}/${firstDayOfWeek.month}/${firstDayOfWeek.day}`}
                      className={cn(
                        'mt-0.5 w-6 min-w-fit basis-6.75 p-0 lg:w-7 lg:basis-7.75',
                        weekIndex === 0 && 'top-0.5'
                      )}
                    >
                      {getISOWeek(monday.toDate(state.timeZone))}
                    </Button>
                  </Tooltip>
                  <Tooltip
                    closeDelay={0}
                    content={
                      weekNote
                        ? 'Edit note about this week'
                        : 'Add note about this week'
                    }
                  >
                    <Button
                      isIconOnly
                      color="primary"
                      radius={isDesktop ? 'md' : 'sm'}
                      variant={isDesktop ? 'flat' : weekNote ? 'solid' : 'flat'}
                      onPress={() => {
                        openNoteDrawer(firstDayOfWeek, 'week');
                      }}
                      className={cn(
                        'mb-0 w-6 min-w-fit basis-19.75 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 lg:w-7 lg:basis-26.75',
                        (weekNote || !isDesktop) && 'opacity-100',
                        weekIndex === 0 && 'basis-19.25 lg:basis-26.75'
                      )}
                    >
                      {weekNote ? (
                        <NoteIcon size={16} weight="bold" />
                      ) : (
                        <NotePencilIcon size={16} weight="bold" />
                      )}
                    </Button>
                  </Tooltip>
                </div>
                <div
                  className={cn(
                    'flex h-27.5 w-full basis-full justify-between border-r-2 border-l-2 border-neutral-500 group-first-of-type:border-t-2 last-of-type:border-b-2 lg:h-auto dark:border-neutral-400',
                    weekIndex === 0 && 'rounded-t-lg',
                    weekIndex === weeksInMonthCount - 1 && 'rounded-b-lg'
                  )}
                >
                  {state
                    .getDatesInWeek(weekIndex)
                    .map((calendarDate, dayIndex) => {
                      if (!calendarDate) {
                        return null;
                      }

                      const startDate = toZoned(
                        calendarDate,
                        getLocalTimeZone()
                      ).set({
                        hour: 0,
                        millisecond: 0,
                        minute: 0,
                        second: 0,
                      });

                      const endDate = toZoned(
                        calendarDate,
                        getLocalTimeZone()
                      ).set({
                        hour: 23,
                        millisecond: 999,
                        minute: 59,
                        second: 59,
                      });

                      return (
                        <MonthCalendarCell
                          state={state}
                          date={calendarDate}
                          key={calendarDate.toString()}
                          position={getCellPosition(weekIndex, dayIndex)}
                          occurrences={occurrences.filter(
                            ({ occurredAt, timeZone }) => {
                              const occurrenceDate = parseAbsolute(
                                occurredAt,
                                timeZone
                              );

                              return (
                                occurrenceDate.compare(startDate) >= 0 &&
                                occurrenceDate.compare(endDate) <= 0
                              );
                            }
                          )}
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
