import { cn, Button, Tooltip, Skeleton, useDisclosure } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import { getWeeksInMonth, toCalendarDateTime } from '@internationalized/date';
import { NoteIcon, NotePencilIcon } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendarGrid } from 'react-aria';
import { Link } from 'react-router';
import type { CalendarState } from 'react-stately';

import { OccurrenceDialog } from '@components';
import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import type { Occurrence } from '@models';
import { useWeekNotes, useNoteDrawerActions } from '@stores';
import { isTruthy, toSqlDate, getISOWeek } from '@utils';

import type { CellPosition } from './MonthCalendarCell';
import MonthCalendarCell from './MonthCalendarCell';

type CalendarGridProps = {
  occurrences: Occurrence[];
  state: CalendarState;
};

const MonthCalendarGrid = ({ occurrences, state }: CalendarGridProps) => {
  const { firstDayOfWeek, isLoadingFirstDayOfWeek } = useFirstDayOfWeek();
  const { gridProps, weekDays } = useCalendarGrid(
    {
      firstDayOfWeek,
      weekdayStyle: 'short',
    },
    state
  );
  const { isDesktop } = useScreenWidth();
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const weekNotes = useWeekNotes();
  const [newOccurrenceDate, setNewOccurrenceDate] =
    React.useState<CalendarDate | null>(null);
  const {
    isOpen: isOccurrenceDialogOpen,
    onClose: closeOccurrenceDialog,
    onOpen: openOccurrenceDialog,
  } = useDisclosure();
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
              <Skeleton
                isLoaded={!isLoadingFirstDayOfWeek}
                className="h-6 w-9 rounded-lg text-center"
              >
                <p className="font-bold">{capitalize(weekDay)}</p>
              </Skeleton>
            </div>
          );
        })}
      </div>

      {newOccurrenceDate && (
        <OccurrenceDialog
          timeZone={state.timeZone}
          isOpen={isOccurrenceDialogOpen}
          onClose={closeOccurrenceDialog}
          newOccurrenceDate={newOccurrenceDate}
        />
      )}

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
            const daysOfWeek = state.getDatesInWeek(weekIndex).filter(isTruthy);
            const [firstDayOfWeek] = daysOfWeek;
            const monday = daysOfWeek.find((d) => {
              return d.toDate(state.timeZone).getDay() === 1;
            })!;

            const weekNote = weekNotes.find((note) => {
              return note.periodDate === toSqlDate(monday);
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
                        openNoteDrawer(monday, 'week');
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
                    .map((calendarDate: CalendarDate | null, dayIndex) => {
                      if (!calendarDate) {
                        return null;
                      }

                      const startDate = toCalendarDateTime(calendarDate)
                        .set({
                          hour: 0,
                          millisecond: 0,
                          minute: 0,
                          second: 0,
                        })
                        .toDate(state.timeZone);

                      const endDate = toCalendarDateTime(calendarDate)
                        .set({
                          hour: 23,
                          millisecond: 999,
                          minute: 59,
                          second: 59,
                        })
                        .toDate(state.timeZone);

                      return (
                        <MonthCalendarCell
                          state={state}
                          date={calendarDate}
                          key={calendarDate.toString()}
                          position={getCellPosition(weekIndex, dayIndex)}
                          onNewOccurrenceClick={() => {
                            setNewOccurrenceDate(calendarDate);
                            openOccurrenceDialog();
                          }}
                          occurrences={occurrences.filter(({ timestamp }) => {
                            return (
                              timestamp >= Number(startDate) &&
                              timestamp <= Number(endDate)
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
