import { isCalendarDay } from '@helpers';
import { useScreenWidth } from '@hooks';
import type { CalendarDate } from '@internationalized/date';
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
import { format, isToday, isFuture, startOfMonth, addMonths } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
// import { useCalendarCell } from 'react-aria';
import { useNavigate } from 'react-router-dom';
import type { CalendarState } from 'react-stately';

import OccurrenceChip from './OccurrenceChip';

export type CellPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | '';

export type CellRangeStatus = 'below-range' | 'in-range' | 'above-range' | '';

type CalendarCellProps = {
  state: CalendarState;
  date: CalendarDate;
  visibleMonth: Date;
  onAddNote: () => void;
  onAddOccurrence: () => void;
  rangeStatus: CellRangeStatus;
  position: CellPosition;
};

const MonthCalendarCell = ({
  // state,
  date,
  visibleMonth,
  onAddNote,
  onAddOccurrence,
  rangeStatus,
  position,
}: CalendarCellProps) => {
  const cellRef = React.useRef<HTMLDivElement>(null);
  // const cellProps = useCalendarCell({ date }, state, cellRef);
  const user = useUser();
  const { removeOccurrence, fetchingOccurrences, occurrencesByDate } =
    useOccurrencesStore();
  const { notes, fetchingNotes } = useNotesStore();
  const { isDesktop, isMobile } = useScreenWidth();
  const cellDate = new Date(date.year, date.month - 1, date.day);
  const isTodayCell = isToday(cellDate);
  const isFutureCell = isFuture(cellDate);
  const formattedDay = format(cellDate, 'yyyy-MM-dd');
  const navigate = useNavigate();

  const occurrences = isCalendarDay(formattedDay)
    ? occurrencesByDate[formattedDay] || []
    : [];
  const hasNote = notes.some((note) => note.day === formattedDay);

  const groupedOccurrences = Object.groupBy(occurrences, (o) => o.habitId);

  const handleAddNoteClick = React.useCallback(() => {
    if (fetchingOccurrences || !user) {
      return null;
    }

    return onAddNote();
  }, [fetchingOccurrences, user, onAddNote]);

  const handleAddOccurrenceClick = React.useCallback(
    (e?: React.MouseEvent, forceOpenDialog = false) => {
      if (fetchingOccurrences || !user) {
        return null;
      }

      if (!isTodayCell) {
        if (rangeStatus === 'below-range') {
          const prevMonth = startOfMonth(addMonths(visibleMonth, -1));

          return navigate(
            `/calendar/month/${prevMonth.getFullYear()}/${prevMonth.getMonth() + 1}/1`
          );
        }

        if (rangeStatus === 'above-range') {
          const nextMonth = startOfMonth(addMonths(visibleMonth, 1));

          return navigate(
            `/calendar/month/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/1`
          );
        }
      }

      if (!isFutureCell || forceOpenDialog) {
        return onAddOccurrence();
      }
    },
    [
      fetchingOccurrences,
      onAddOccurrence,
      rangeStatus,
      user,
      isTodayCell,
      isFutureCell,
      visibleMonth,
      navigate,
    ]
  );

  React.useEffect(() => {
    const cell = cellRef.current;

    if (!cell) {
      return;
    }

    const enterHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleAddOccurrenceClick(undefined, true);
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
    if (!isTodayCell) {
      return null;
    }

    return <CalendarBlank size={20} weight="fill" />;
  };

  const cellRootClassName = clsx(
    'group/cell flex h-auto flex-1 flex-col gap-2 border-r-2 border-neutral-500 transition-colors last-of-type:border-r-0 hover:bg-neutral-200 dark:border-neutral-400 dark:hover:bg-neutral-800 lg:h-36',
    rangeStatus === 'below-range' && 'cursor-w-resize',
    rangeStatus === 'above-range' && 'cursor-e-resize',
    position === 'top-left' && 'rounded-tl-md',
    position === 'top-right' && 'rounded-tr-md',
    position === 'bottom-left' && 'rounded-bl-md',
    position === 'bottom-right' && 'rounded-br-md',
    isTodayCell &&
      'bg-background-100 hover:bg-background-300 dark:bg-background-700 dark:hover:bg-background-700'
  );

  const cellHeaderClassName = clsx(
    'flex w-full items-center justify-between border-b-1 border-neutral-500 px-1.5 py-1.5 text-sm dark:border-neutral-400 md:text-base',
    rangeStatus !== 'in-range' && 'text-neutral-400 dark:text-neutral-600',
    isTodayCell ? 'w-full self-auto md:self-start' : 'w-full'
  );

  return (
    <div
      // {...cellProps}
      className={cellRootClassName}
      ref={cellRef}
      tabIndex={0}
      onClick={(e) => handleAddOccurrenceClick(e)}
    >
      <div className={cellHeaderClassName}>
        <p className="font-bold">{date.day}</p>
        <div className="flex items-center justify-between gap-2">
          {rangeStatus === 'in-range' && !isMobile && (
            <div className="flex items-center gap-1">
              {!isFutureCell && (
                <Tooltip content="Log habit" closeDelay={0}>
                  <Button
                    className="h-5 min-w-fit px-2 opacity-100 transition-opacity group-hover/cell:opacity-100 md:opacity-0 lg:h-6 lg:px-4"
                    radius="sm"
                    onClick={(e) => handleAddOccurrenceClick(e, true)}
                    color="secondary"
                    isDisabled={fetchingOccurrences || !user}
                  >
                    <CalendarPlus weight="bold" size={isDesktop ? 18 : 14} />
                  </Button>
                </Tooltip>
              )}
              <Tooltip
                content={hasNote ? 'Edit note' : 'Add note'}
                closeDelay={0}
              >
                <Button
                  className={clsx(
                    'h-5 min-w-fit px-2 opacity-0 transition-opacity group-hover/cell:opacity-100 lg:h-6 lg:px-4',
                    hasNote && 'opacity-100'
                  )}
                  radius="sm"
                  onClick={handleAddNoteClick}
                  color={hasNote ? 'success' : 'secondary'}
                  isDisabled={fetchingNotes || !user}
                >
                  {hasNote ? (
                    <NotePencil weight="bold" size={isDesktop ? 18 : 14} />
                  ) : (
                    <NoteBlank weight="bold" size={isDesktop ? 18 : 14} />
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

export default MonthCalendarCell;
