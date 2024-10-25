import { useScreenSize } from '@hooks';
import { CalendarBlank } from '@phosphor-icons/react';
import { useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import OccurrenceChip from './OccurrenceChip';

type CalendarCellProps = {
  dateNumber: number;
  monthNumber: number;
  fullYear: number;
  onClick: (dateNumber: number, monthNumber: number, fullYear: number) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  rangeStatus: 'below-range' | 'in-range' | 'above-range';
};

const CalendarCell = ({
  dateNumber,
  monthNumber,
  fullYear,
  onNavigateBack,
  onNavigateForward,
  onClick,
  rangeStatus,
}: CalendarCellProps) => {
  const cellRef = React.useRef<HTMLDivElement>(null);
  const user = useUser();
  const { removeOccurrence, fetchingOccurrences, occurrencesByDate } =
    useOccurrencesStore();
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
  const occurrences = occurrencesByDate[date] || [];

  const groupedOccurrences = Object.groupBy(occurrences, (o) => o.habitId);

  const handleClick = React.useCallback(() => {
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

    return onClick(dateNumber, monthNumber, fullYear);
  }, [
    isToday,
    dateNumber,
    fetchingOccurrences,
    fullYear,
    monthNumber,
    onClick,
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
        handleClick();
      }
    };

    cell.addEventListener('keydown', enterHandler);

    return () => {
      cell.removeEventListener('keydown', enterHandler);
    };
  }, [cellRef, handleClick]);

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

    const isMobile = screenSize < 768;

    if (isMobile) {
      return <CalendarBlank weight="bold" size={18} />;
    }

    return <p className="font-bold">Today</p>;
  };

  const cellRootClassName = clsx(
    'flex h-28 flex-1 flex-col border-r-2 border-neutral-500 last-of-type:border-r-0 hover:bg-neutral-200 dark:border-neutral-400 dark:hover:bg-neutral-800',
    rangeStatus === 'below-range' && 'cursor-w-resize',
    rangeStatus === 'above-range' && 'cursor-e-resize',
    isToday &&
      'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700'
  );

  const cellHeaderClassName = clsx(
    'flex items-center justify-between rounded-t px-1 py-0.5',
    rangeStatus !== 'in-range' && 'text-neutral-400 dark:text-neutral-600'
  );

  return (
    <div
      className={cellRootClassName}
      ref={cellRef}
      onClick={handleClick}
      tabIndex={0}
      role="button"
    >
      <div className={cellHeaderClassName}>
        <p className="font-bold">{dateNumber}</p>
        {renderToday()}
      </div>
      <div className="flex flex-wrap gap-1 overflow-auto px-2 py-0.5 pb-1">
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
                  exit={{ opacity: 0 }}
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
