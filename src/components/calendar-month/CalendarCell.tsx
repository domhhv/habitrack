import { isCalendarDay } from '@helpers';
import { useScreenSize } from '@hooks';
import { Button, Tooltip } from '@nextui-org/react';
import {
  CalendarBlank,
  CalendarPlus,
  NoteBlank,
  NotePencil,
} from '@phosphor-icons/react';
import { useNotesStore, useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import OccurrenceChip from './OccurrenceChip';

export type CellPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | '';

export type CellRangeStatus = 'below-range' | 'in-range' | 'above-range';

type CalendarCellProps = {
  dateNumber: number;
  monthNumber: number;
  fullYear: number;
  onAddNote: (
    dateNumber: number,
    monthNumber: number,
    fullYear: number
  ) => void;
  onAddOccurrence: (
    dateNumber: number,
    monthNumber: number,
    fullYear: number
  ) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  rangeStatus: CellRangeStatus;
  position: CellPosition;
};

const CalendarCell = ({
  dateNumber,
  monthNumber,
  fullYear,
  onNavigateBack,
  onNavigateForward,
  onAddNote,
  onAddOccurrence,
  rangeStatus,
  position,
}: CalendarCellProps) => {
  const cellRef = React.useRef<HTMLDivElement>(null);
  const user = useUser();
  const { removeOccurrence, fetchingOccurrences, occurrencesByDate } =
    useOccurrencesStore();
  const { notes, fetchingNotes } = useNotesStore();
  const today = new Date();
  const isToday =
    today.getDate() === dateNumber &&
    today.getMonth() + 1 === monthNumber &&
    today.getFullYear() === fullYear;
  const screenSize = useScreenSize();
  const date = format(
    new Date(fullYear, monthNumber - 1, dateNumber),
    'yyyy-MM-dd'
  );
  const isFutureDate =
    new Date() < new Date(fullYear, monthNumber - 1, dateNumber);

  const occurrences = isCalendarDay(date) ? occurrencesByDate[date] || [] : [];
  const isMobile = screenSize < 768;
  const hasNote = notes.some((note) => note.day === date);

  const groupedOccurrences = Object.groupBy(occurrences, (o) => o.habitId);

  const handleAddNoteClick = React.useCallback(() => {
    if (fetchingOccurrences || !user) {
      return null;
    }

    return onAddNote(dateNumber, monthNumber, fullYear);
  }, [fetchingOccurrences, user, dateNumber, monthNumber, fullYear, onAddNote]);

  const handleAddOccurrenceClick = React.useCallback(() => {
    if (fetchingOccurrences || !user) {
      return null;
    }

    if (!isToday) {
      if (rangeStatus === 'below-range') {
        return onNavigateBack?.();
      }

      if (rangeStatus === 'above-range') {
        return onNavigateForward?.();
      }
    }

    return onAddOccurrence(dateNumber, monthNumber, fullYear);
  }, [
    isToday,
    dateNumber,
    fetchingOccurrences,
    fullYear,
    monthNumber,
    onAddOccurrence,
    onNavigateBack,
    onNavigateForward,
    rangeStatus,
    user,
  ]);

  React.useEffect(() => {
    const cell = cellRef.current;

    if (!cell) {
      return;
    }

    const enterHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleAddOccurrenceClick();
      }
    };

    cell.addEventListener('keydown', enterHandler);

    return () => {
      cell.removeEventListener('keydown', enterHandler);
    };
  }, [cellRef, handleAddOccurrenceClick]);

  const handleOccurrenceDelete = async (
    occurrenceId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => {
    clickEvent.stopPropagation();
    void removeOccurrence(occurrenceId);
  };

  const renderToday = () => {
    if (!isToday) {
      return null;
    }

    return <CalendarBlank size={14} weight="bold" />;
  };

  const cellRootClassName = clsx(
    'group/cell flex h-auto flex-1 flex-col gap-2 border-r-2 border-neutral-500 transition-colors last-of-type:border-r-0 hover:bg-neutral-200 dark:border-neutral-400 dark:hover:bg-neutral-800 lg:h-36',
    rangeStatus === 'below-range' && 'cursor-w-resize',
    rangeStatus === 'above-range' && 'cursor-e-resize',
    position === 'top-left' && 'rounded-tl-md',
    position === 'top-right' && 'rounded-tr-md',
    position === 'bottom-left' && 'rounded-bl-md',
    position === 'bottom-right' && 'rounded-br-md',
    isToday &&
      'bg-background-200 hover:bg-background-300 dark:bg-background-800 dark:hover:bg-background-700'
  );

  const cellHeaderClassName = clsx(
    'flex w-full items-center justify-between border-b-1 border-neutral-500 px-1.5 py-1.5 text-sm dark:border-neutral-400 md:text-base',
    rangeStatus !== 'in-range' && 'text-neutral-400 dark:text-neutral-600',
    isToday ? 'w-full self-auto md:self-start' : 'w-full'
  );

  return (
    <div
      className={cellRootClassName}
      ref={cellRef}
      tabIndex={0}
      onClick={isMobile ? handleAddOccurrenceClick : undefined}
    >
      <div className={cellHeaderClassName}>
        <p className="font-bold">{dateNumber}</p>
        <div className="flex items-center justify-between gap-2">
          {rangeStatus === 'in-range' && !isMobile && (
            <div className="flex items-center gap-1">
              {!isFutureDate && (
                <Tooltip content="Log habit" closeDelay={0}>
                  <Button
                    className="h-6 min-w-fit px-4 opacity-100 transition-opacity group-hover/cell:opacity-100 md:opacity-0"
                    radius="sm"
                    onClick={handleAddOccurrenceClick}
                    color="primary"
                    isDisabled={fetchingOccurrences || !user}
                  >
                    <CalendarPlus weight="bold" size={18} />
                  </Button>
                </Tooltip>
              )}
              <Tooltip
                content={hasNote ? 'Edit note' : 'Add note'}
                closeDelay={0}
              >
                <Button
                  className={clsx(
                    'h-6 min-w-fit px-4 opacity-0 transition-opacity group-hover/cell:opacity-100',
                    hasNote && 'opacity-100'
                  )}
                  radius="sm"
                  onClick={handleAddNoteClick}
                  color={hasNote ? 'success' : 'primary'}
                  isDisabled={fetchingNotes || !user}
                >
                  {hasNote ? (
                    <NotePencil weight="bold" size={18} />
                  ) : (
                    <NoteBlank weight="bold" size={14} />
                  )}
                </Button>
              </Tooltip>
            </div>
          )}
          {renderToday()}
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
                    onDelete={handleOccurrenceDelete}
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

export default CalendarCell;
