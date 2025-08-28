import { cn, Button, Tooltip, useDisclosure } from '@heroui/react';
import { getWeeksInMonth, type CalendarDate } from '@internationalized/date';
import { NotePencil, Note as NoteIcon } from '@phosphor-icons/react';
import {
  format,
  endOfDay,
  addMonths,
  startOfDay,
  getISOWeek,
  isSameMonth,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useLocale, useCalendarGrid } from 'react-aria';
import { Link } from 'react-router';
import { type CalendarState } from 'react-stately';

import { NoteDialog, OccurrenceDialog } from '@components';
import { useScreenWidth } from '@hooks';
import type { Occurrence, NotePeriodKind } from '@models';
import { useWeekNotes } from '@stores';
import { isTruthy } from '@utils';

import type { CellPosition, CellRangeStatus } from './MonthCalendarCell';
import MonthCalendarCell from './MonthCalendarCell';

type CalendarGridProps = {
  activeMonthIndex: number;
  activeYear: number;
  occurrences: Occurrence[];
  state: CalendarState;
};

const MonthCalendarGrid = ({
  activeMonthIndex,
  activeYear,
  occurrences,
  state,
}: CalendarGridProps) => {
  const { gridProps, weekDays } = useCalendarGrid(
    {
      weekdayStyle: 'short',
    },
    state
  );
  const { isDesktop } = useScreenWidth();
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const visibleMonth = new Date(activeYear, activeMonthIndex, 1);
  const prevMonth = addMonths(visibleMonth, -1);
  const nextMonth = addMonths(visibleMonth, 1);
  const weekNotes = useWeekNotes();
  const [noteDate, setNoteDate] = React.useState<Date | null>(null);
  const [notePeriod, setNotePeriod] = React.useState<NotePeriodKind>(null);
  const [newOccurrenceDate, setNewOccurrenceDate] = React.useState<Date | null>(
    null
  );
  const {
    isOpen: isNoteDialogOpen,
    onClose: closeNoteDialog,
    onOpen: openNoteDialog,
  } = useDisclosure();
  const {
    isOpen: isOccurrenceDialogOpen,
    onClose: closeOccurrenceDialog,
    onOpen: openOccurrenceDialog,
  } = useDisclosure();

  const handleNoteDialogOpen = (date: Date, period: NotePeriodKind) => {
    setNoteDate(date);
    setNotePeriod(period);
    openNoteDialog();
  };

  const handlePeriodChange = (opts: { date?: Date; kind?: NotePeriodKind }) => {
    if (opts.date) {
      setNoteDate(opts.date);
    }

    if (opts.kind) {
      setNotePeriod(opts.kind);
    }
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
        {weekDays.map((weekDay) => {
          return (
            <div
              key={weekDay}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <p className="font-bold">{weekDay}</p>
            </div>
          );
        })}
      </div>

      {newOccurrenceDate && (
        <OccurrenceDialog
          isOpen={isOccurrenceDialogOpen}
          onClose={closeOccurrenceDialog}
          newOccurrenceDate={newOccurrenceDate}
        />
      )}

      {noteDate && (
        <NoteDialog
          periodKind={notePeriod}
          isOpen={isNoteDialogOpen}
          onClose={closeNoteDialog}
          onPeriodChange={handlePeriodChange}
          periodDate={format(noteDate, 'yyyy-MM-dd')}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          exit={{ opacity: 0 }}
          key={activeMonthIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="flex flex-1 flex-col"
        >
          {weekIndexes.map((weekIndex) => {
            const [{ day, month, year }] = state
              .getDatesInWeek(weekIndex)
              .filter(isTruthy);

            const weekNote = weekNotes.find((note) => {
              return (
                note.periodDate ===
                format(new Date(year, month - 1, day), 'yyyy-MM-dd')
              );
            });

            return (
              <div
                key={weekIndex}
                className="group relative flex items-end gap-1 md:gap-2"
              >
                <div className="absolute top-0 -left-7 flex h-full flex-col justify-between gap-1 lg:-left-12">
                  <Tooltip content="Go to this week">
                    <Button
                      as={Link}
                      variant="ghost"
                      radius={isDesktop ? 'md' : 'sm'}
                      to={`/calendar/week/${year}/${month}/${day}`}
                      className={cn(
                        'mt-0.5 w-6 min-w-fit basis-[30px] p-0 md:basis-[35px] lg:w-10 lg:basis-[37px]',
                        weekIndex === 0 && 'top-0.5'
                      )}
                    >
                      {getISOWeek(new Date(year, month - 1, day))}
                    </Button>
                  </Tooltip>
                  <Tooltip
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
                        handleNoteDialogOpen(
                          new Date(year, month - 1, day),
                          'week'
                        );
                      }}
                      className={cn(
                        'mb-1 w-6 min-w-fit basis-[70px] p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 lg:mb-2 lg:w-10 lg:basis-[96px]',
                        weekIndex === 0 && 'top-0.5',
                        (weekNote || !isDesktop) && 'opacity-100'
                      )}
                    >
                      {weekNote ? (
                        <NoteIcon size={16} weight="bold" />
                      ) : (
                        <NotePencil size={16} weight="bold" />
                      )}
                    </Button>
                  </Tooltip>
                </div>
                <div
                  className={cn(
                    'flex h-[110px] w-full basis-full justify-between border-r-2 border-l-2 border-neutral-500 group-first-of-type:border-t-2 last-of-type:border-b-2 lg:h-auto dark:border-neutral-400',
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

                      return (
                        <MonthCalendarCell
                          date={date}
                          rangeStatus={rangeStatus}
                          key={calendarDate.toString()}
                          position={getCellPosition(weekIndex, dayIndex)}
                          onNoteClick={() => {
                            handleNoteDialogOpen(date, 'day');
                          }}
                          onNewOccurrenceClick={() => {
                            setNewOccurrenceDate(date);
                            openOccurrenceDialog();
                          }}
                          occurrences={occurrences.filter(({ timestamp }) => {
                            return (
                              timestamp >= Number(startOfDay(date)) &&
                              timestamp <= Number(endOfDay(date))
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
