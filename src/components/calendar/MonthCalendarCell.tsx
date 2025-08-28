import { cn, Button, Tooltip } from '@heroui/react';
import {
  Note,
  NoteBlank,
  CalendarPlus,
  CalendarBlank,
} from '@phosphor-icons/react';
import { format, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import groupBy from 'lodash.groupby';
import React from 'react';

import { OccurrenceChip } from '@components';
import { useUser, useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { useDayNotes } from '@stores';

export type CellPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | '';

export type CellRangeStatus = 'below-range' | 'in-range' | 'above-range' | '';

type CalendarCellProps = {
  date: Date;
  occurrences: Occurrence[];
  position: CellPosition;
  rangeStatus: CellRangeStatus;
  onNewOccurrenceClick: () => void;
  onNoteClick: () => void;
};

const MonthCalendarCell = ({
  date,
  occurrences,
  onNewOccurrenceClick,
  onNoteClick,
  position,
  rangeStatus,
}: CalendarCellProps) => {
  const dayNotes = useDayNotes();
  const { user } = useUser();
  const { isDesktop, isMobile } = useScreenWidth();
  const isTodayCell = isToday(date);
  const formattedDay = format(date, 'yyyy-MM-dd');
  const hasNote = React.useMemo(() => {
    return dayNotes.some((note) => {
      return note.periodDate === formattedDay;
    });
  }, [dayNotes, formattedDay]);

  const groupedOccurrences = groupBy(occurrences, (o) => {
    return o.habitId;
  });

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
    'flex w-full items-center justify-between border-b border-neutral-500 px-1.5 py-1.5 text-sm dark:border-neutral-400 md:text-base',
    rangeStatus !== 'in-range' && 'text-neutral-400 dark:text-neutral-600',
    isTodayCell ? 'w-full self-auto md:self-start' : 'w-full'
  );

  return (
    <>
      <div className={cellRootClassName}>
        <div
          className={cellHeaderClassName}
          onClick={isMobile ? onNewOccurrenceClick : undefined}
        >
          <p className="font-bold">{date.getDate()}</p>
          <div className="flex items-center justify-between gap-2">
            {!isMobile && (
              <div className="flex items-center gap-1">
                <Tooltip closeDelay={0} content="Log habit">
                  <Button
                    radius="sm"
                    tabIndex={0}
                    variant="light"
                    color="secondary"
                    isDisabled={!user}
                    onPress={onNewOccurrenceClick}
                    className="h-5 w-5 min-w-fit px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
                  >
                    <CalendarPlus weight="bold" size={isDesktop ? 18 : 14} />
                  </Button>
                </Tooltip>
                <Tooltip
                  closeDelay={0}
                  content={hasNote ? 'Edit note' : 'Add note'}
                >
                  <Button
                    radius="sm"
                    tabIndex={0}
                    variant="light"
                    isDisabled={!user}
                    onPress={onNoteClick}
                    color={hasNote ? 'primary' : 'secondary'}
                    className={cn(
                      'h-5 w-5 min-w-fit px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                      hasNote && 'opacity-100'
                    )}
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
            {isTodayCell && (
              <CalendarBlank weight="fill" size={isMobile ? 18 : 20} />
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 overflow-x-auto overflow-y-visible px-0 py-0.5 pb-2 md:justify-start md:px-2">
          <AnimatePresence mode="sync">
            {Object.entries(groupedOccurrences).map(
              ([habitId, habitOccurrences]) => {
                if (!habitOccurrences) {
                  return null;
                }

                return (
                  <motion.div
                    key={habitId}
                    exit={{ scale: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OccurrenceChip occurrences={habitOccurrences} />
                  </motion.div>
                );
              }
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default MonthCalendarCell;
