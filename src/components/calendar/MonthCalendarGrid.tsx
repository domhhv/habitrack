import { cn, Button, Tooltip, useDisclosure } from '@heroui/react';
import { getWeeksInMonth, type CalendarDate } from '@internationalized/date';
import { NotePencil, Note as NoteIcon } from '@phosphor-icons/react';
import { endOfDay, addMonths, startOfDay, isSameMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useLocale, useCalendarGrid } from 'react-aria';
import { Link } from 'react-router';
import { type CalendarState } from 'react-stately';

import { NoteDialog } from '@components';
import { getIsoWeek } from '@helpers';
import { useScreenWidth } from '@hooks';
import type { Occurrence, NotePeriodKind } from '@models';
import { useNotes } from '@stores';
import { isTruthy, toSqlDate, getMonthIndex, noteTargetIsPeriod } from '@utils';

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
  const notes = useNotes();
  const [noteDate, setNoteDate] = React.useState<Date | null>(null);
  const [notePeriod, setNotePeriod] = React.useState<NotePeriodKind>(null);
  const {
    isOpen: isNoteDialogOpen,
    onClose: closeNoteDialog,
    onOpen: openNoteDialog,
  } = useDisclosure();

  const handleNoteDialogOpen = (date: Date, period: NotePeriodKind) => {
    setNoteDate(date);
    setNotePeriod(period);
    openNoteDialog();
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

      {noteDate && (
        <NoteDialog
          periodKind={notePeriod}
          isOpen={isNoteDialogOpen}
          onClose={closeNoteDialog}
          periodDate={toSqlDate(noteDate)}
        />
      )}

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

            const weekNote = notes.filter(noteTargetIsPeriod).find((note) => {
              return (
                note.periodKind === 'week' &&
                note.periodDate === toSqlDate(new Date(year, month - 1, day))
              );
            });

            return (
              <div
                key={weekIndex}
                className="group relative flex items-end gap-1 md:gap-2"
              >
                <div className="absolute -left-7 top-0 flex h-full flex-col justify-between gap-1 lg:-left-12">
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
                      {getIsoWeek(new Date(year, month - 1, day))}
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
                        'mb-1 w-6 min-w-fit basis-[70px] p-0 opacity-0 focus:opacity-100 group-hover:opacity-100 lg:mb-2 lg:w-10 lg:basis-[96px]',
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
                          onNoteClick={() => {
                            handleNoteDialogOpen(date, 'day');
                          }}
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
