import { isCalendarDay } from '@helpers';
import { Button, cn, Tooltip } from '@heroui/react';
import { useScreenWidth, useUser } from '@hooks';
import type { CalendarDate } from '@internationalized/date';
import {
  CalendarBlank,
  CalendarPlus,
  Note,
  NoteBlank,
} from '@phosphor-icons/react';
import { useNotesStore, useOccurrencesStore } from '@stores';
import { format, isToday } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import OccurrenceChip from './OccurrenceChip';

export type CellPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | '';

export type CellRangeStatus = 'below-range' | 'in-range' | 'above-range' | '';

type CalendarCellProps = {
  date: CalendarDate;
  onDayNoteClick: () => void;
  onAddOccurrence: () => void;
  onEditOccurrence: (occurrenceId: number) => void;
  rangeStatus: CellRangeStatus;
  position: CellPosition;
};

const MonthCalendarCell = ({
  date,
  onDayNoteClick,
  onAddOccurrence,
  onEditOccurrence,
  rangeStatus,
  position,
}: CalendarCellProps) => {
  const { removeOccurrence, fetchingOccurrences, occurrencesByDate } =
    useOccurrencesStore();
  const { notes, fetchingNotes } = useNotesStore();
  const { user } = useUser();
  const { isDesktop, isMobile } = useScreenWidth();
  const cellDate = new Date(date.year, date.month - 1, date.day);
  const isTodayCell = isToday(cellDate);
  const formattedDay = format(cellDate, 'yyyy-MM-dd');
  const hasNote = notes.some((note) => note.day === formattedDay);

  const occurrences = isCalendarDay(formattedDay)
    ? occurrencesByDate[formattedDay] || []
    : [];

  const groupedOccurrences = Object.groupBy(occurrences, (o) => o.habitId);

  const cellRootClassName = cn(
    'group/cell flex h-auto flex-1 flex-col gap-2 border-r-2 border-neutral-500 transition-colors last-of-type:border-r-0 hover:bg-neutral-200 focus:border-neutral-100 dark:border-neutral-400 dark:hover:bg-neutral-800 lg:h-36',
    position === 'top-left' && 'rounded-tl-md',
    position === 'top-right' && 'rounded-tr-md',
    position === 'bottom-left' && 'rounded-bl-md',
    position === 'bottom-right' && 'rounded-br-md',
    isTodayCell &&
      'bg-background-100 hover:bg-background-300 dark:bg-background-700 dark:hover:bg-background-700'
  );

  const cellHeaderClassName = cn(
    'flex w-full items-center justify-between border-b-1 border-neutral-500 px-1.5 py-1.5 text-sm dark:border-neutral-400 md:text-base',
    rangeStatus !== 'in-range' && 'text-neutral-400 dark:text-neutral-600',
    isTodayCell ? 'w-full self-auto md:self-start' : 'w-full'
  );

  return (
    <div className={cellRootClassName} onClick={onAddOccurrence}>
      <div className={cellHeaderClassName}>
        <p className="font-bold">{date.day}</p>
        <div className="flex items-center justify-between gap-2">
          {!isMobile && (
            <div className="flex items-center gap-1">
              <Tooltip content="Log habit" closeDelay={0}>
                <Button
                  className="h-5 w-5 min-w-fit px-0 opacity-0 focus:opacity-100 group-hover/cell:opacity-100 lg:h-6 lg:w-6"
                  variant="light"
                  radius="sm"
                  onPress={onAddOccurrence}
                  color="secondary"
                  isDisabled={fetchingOccurrences || !user}
                  tabIndex={0}
                >
                  <CalendarPlus weight="bold" size={isDesktop ? 18 : 14} />
                </Button>
              </Tooltip>
              <Tooltip
                content={hasNote ? 'Edit note' : 'Add note'}
                closeDelay={0}
              >
                <Button
                  className={cn(
                    'h-5 w-5 min-w-fit px-0 opacity-0 focus:opacity-100 group-hover/cell:opacity-100 lg:h-6 lg:w-6',
                    hasNote && 'opacity-100'
                  )}
                  variant="light"
                  radius="sm"
                  onPress={onDayNoteClick}
                  color={hasNote ? 'primary' : 'secondary'}
                  isDisabled={fetchingNotes || !user}
                  tabIndex={0}
                >
                  {hasNote ? (
                    <Note weight="bold" size={isDesktop ? 18 : 14} />
                  ) : (
                    <NoteBlank weight="bold" size={isDesktop ? 18 : 14} />
                  )}
                </Button>
              </Tooltip>
            </div>
          )}
          {isTodayCell && <CalendarBlank size={20} weight="fill" />}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 overflow-x-auto overflow-y-visible px-0 py-0.5 pb-2 md:justify-start md:px-2">
        <AnimatePresence mode="sync">
          {Object.entries(groupedOccurrences).map(
            ([habitId, habitOccurrences]) => {
              if (!habitOccurrences) {
                return null;
              }

              return (
                <motion.div
                  key={habitId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <OccurrenceChip
                    occurrences={habitOccurrences}
                    onDelete={removeOccurrence}
                    onEdit={onEditOccurrence}
                  />
                </motion.div>
              );
            }
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MonthCalendarCell;
