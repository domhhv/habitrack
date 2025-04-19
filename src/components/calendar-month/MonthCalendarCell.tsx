import { NoteDialog, OccurrenceChip, OccurrenceDialog } from '@components';
import { Button, cn, Tooltip, useDisclosure } from '@heroui/react';
import { useScreenWidth, useUser } from '@hooks';
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

export type CellPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | '';

export type CellRangeStatus = 'below-range' | 'in-range' | 'above-range' | '';

type CalendarCellProps = {
  date: Date;
  rangeStatus: CellRangeStatus;
  position: CellPosition;
};

const MonthCalendarCell = ({
  date,
  rangeStatus,
  position,
}: CalendarCellProps) => {
  const { fetchingOccurrences, occurrencesByDate } = useOccurrencesStore();
  const { notes, fetchingNotes } = useNotesStore();
  const { user } = useUser();
  const { isDesktop, isMobile } = useScreenWidth();
  const isTodayCell = isToday(date);
  const formattedDay = format(date, 'yyyy-MM-dd');
  const hasNote = notes.some((note) => {
    return note.day === formattedDay;
  });
  const {
    isOpen: isNoteDialogOpen,
    onOpen: openNoteDialog,
    onClose: closeNoteDialog,
  } = useDisclosure();
  const {
    isOpen: isOccurrenceDialogOpen,
    onOpen: openOccurrenceDialog,
    onClose: closeOccurrenceDialog,
  } = useDisclosure({
    id: date.toISOString(),
  });

  const groupedOccurrences = Object.groupBy(
    occurrencesByDate[formattedDay] || [],
    (o) => {
      return o.habitId;
    }
  );

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
    <>
      <NoteDialog
        open={isNoteDialogOpen}
        onClose={closeNoteDialog}
        date={date}
      />

      <OccurrenceDialog
        isOpen={isOccurrenceDialogOpen}
        onClose={closeOccurrenceDialog}
        newOccurrenceDate={date}
      />

      <div className={cellRootClassName}>
        <div
          className={cellHeaderClassName}
          onClick={isMobile ? openOccurrenceDialog : undefined}
        >
          <p className="font-bold">{date.getDate()}</p>
          <div className="flex items-center justify-between gap-2">
            {!isMobile && (
              <div className="flex items-center gap-1">
                <Tooltip content="Log habit" closeDelay={0}>
                  <Button
                    className="h-5 w-5 min-w-fit px-0 opacity-0 focus:opacity-100 group-hover/cell:opacity-100 lg:h-6 lg:w-6"
                    variant="light"
                    radius="sm"
                    onPress={openOccurrenceDialog}
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
                    onPress={openNoteDialog}
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
            {isTodayCell && (
              <CalendarBlank size={isMobile ? 18 : 20} weight="fill" />
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ scale: 0 }}
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
