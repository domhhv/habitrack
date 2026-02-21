import {
  cn,
  Button,
  Popover,
  Tooltip,
  PopoverContent,
  PopoverTrigger,
} from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import { isToday } from '@internationalized/date';
import {
  NoteIcon,
  NoteBlankIcon,
  SquareHalfIcon,
  CalendarPlusIcon,
  CalendarBlankIcon,
  ArrowSquareRightIcon,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useCalendarCell } from 'react-aria';
import { Link, useNavigate } from 'react-router';
import type { CalendarState } from 'react-stately';

import { OccurrenceChip } from '@components';
import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import {
  useUser,
  useDayNotes,
  useNoteDrawerActions,
  useOccurrenceDrawerActions,
} from '@stores';

export type CellPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | '';

type MonthCalendarCellProps = {
  date: CalendarDate;
  occurrences: Occurrence[];
  position: CellPosition;
  state: CalendarState;
};

const MonthCalendarCell = ({
  date,
  occurrences,
  position,
  state,
}: MonthCalendarCellProps) => {
  const dayNotes = useDayNotes();
  const user = useUser();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
  const calendarCellRef = React.useRef<HTMLDivElement | null>(null);
  const { cellProps, formattedDate, isOutsideVisibleRange } = useCalendarCell(
    { date },
    state,
    calendarCellRef
  );

  const isTodayCell = isToday(date, state.timeZone);

  const hasNote = React.useMemo(() => {
    return dayNotes.some((note) => {
      return note.periodDate === date.toString();
    });
  }, [dayNotes, date]);

  const groupedOccurrences = groupBy(
    occurrences.toSorted((l, r) => {
      const lName = l.habit.name.toLowerCase();
      const rName = r.habit.name.toLowerCase();

      if (lName < rName) {
        return -1;
      }

      if (lName > rName) {
        return 1;
      }

      return 0;
    }),
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
      'bg-background-100 hover:bg-background-300 dark:bg-background-500 dark:hover:bg-background-300'
  );

  const cellHeaderClassName = cn(
    'flex w-full items-center justify-between border-b border-neutral-500 pl-1.5 pr-0.5 py-0.5 text-sm dark:border-neutral-400',
    isOutsideVisibleRange && 'text-neutral-400 dark:text-neutral-600',
    isTodayCell ? 'w-full self-auto md:self-start' : 'w-full',
    isMobile && 'pl-1'
  );

  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const openLoggingDrawer = () => {
    if (!user) {
      return;
    }

    openOccurrenceDrawer({
      dayToLog: date,
    });
  };

  const cellHeader = (
    <div className={cellHeaderClassName}>
      <p className={cn('font-bold', isMobile && 'text-sm')}>{formattedDate}</p>
      <div className="flex items-center justify-between gap-2">
        {isMobile && screenWidth > 360 && hasNote && (
          <NoteIcon size={12} weight="bold" />
        )}
        {isDesktop && (
          <div className="flex items-center gap-1">
            <Tooltip closeDelay={0} content="Open day">
              <Button
                as={Link}
                radius="sm"
                variant="light"
                color="secondary"
                aria-label="Open day"
                to={`/calendar/day/${date.year}/${date.month}/${date.day}`}
                className="h-5 w-5 min-w-fit px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
              >
                <ArrowSquareRightIcon size={18} weight="bold" />
              </Button>
            </Tooltip>
            <Tooltip closeDelay={0} content="Show habit log">
              <Button
                radius="sm"
                variant="light"
                color="secondary"
                isDisabled={!user}
                aria-label="Show habit log"
                className="h-5 w-5 min-w-fit px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
                onPress={() => {
                  openOccurrenceDrawer({
                    dayToDisplay: date,
                  });
                }}
              >
                <SquareHalfIcon size={18} weight="bold" />
              </Button>
            </Tooltip>
            <Tooltip closeDelay={0} content="Log habit">
              <Button
                radius="sm"
                variant="light"
                color="secondary"
                isDisabled={!user}
                aria-label="Log habit"
                onPress={openLoggingDrawer}
                className="h-5 w-5 min-w-fit px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
              >
                <CalendarPlusIcon size={18} weight="bold" />
              </Button>
            </Tooltip>
            <Tooltip
              closeDelay={0}
              content={hasNote ? 'Edit note' : 'Add note'}
            >
              <Button
                radius="sm"
                variant="light"
                isDisabled={!user}
                color={hasNote ? 'primary' : 'secondary'}
                aria-label={hasNote ? 'Edit note' : 'Add note'}
                onPress={() => {
                  openNoteDrawer(date, 'day');
                }}
                className={cn(
                  'h-5 w-5 min-w-fit px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                  hasNote && 'opacity-100'
                )}
              >
                {hasNote ? (
                  <NoteIcon size={18} weight="bold" />
                ) : (
                  <NoteBlankIcon size={18} weight="bold" />
                )}
              </Button>
            </Tooltip>
          </div>
        )}
        {isTodayCell && !isMobile && (
          <CalendarBlankIcon weight="fill" size={isMobile ? 18 : 20} />
        )}
      </div>
    </div>
  );

  return (
    <div ref={calendarCellRef} {...cellProps} className={cellRootClassName}>
      {!isDesktop && user ? (
        <Popover
          offset={4}
          placement="bottom"
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <PopoverTrigger>{cellHeader}</PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-1 p-1">
              <Button
                size="sm"
                variant="light"
                color="secondary"
                className="justify-start"
                startContent={<ArrowSquareRightIcon size={16} weight="bold" />}
                onPress={() => {
                  setIsPopoverOpen(false);
                  navigate(
                    `/calendar/day/${date.year}/${date.month}/${date.day}`
                  );
                }}
              >
                Open day
              </Button>
              <Button
                size="sm"
                variant="light"
                color="secondary"
                className="justify-start"
                startContent={<SquareHalfIcon size={16} weight="bold" />}
                onPress={() => {
                  setIsPopoverOpen(false);
                  openOccurrenceDrawer({
                    dayToDisplay: date,
                  });
                }}
              >
                Show habit log
              </Button>
              <Button
                size="sm"
                variant="light"
                color="secondary"
                className="justify-start"
                startContent={<CalendarPlusIcon size={16} weight="bold" />}
                onPress={() => {
                  setIsPopoverOpen(false);
                  openLoggingDrawer();
                }}
              >
                Log habit
              </Button>
              <Button
                size="sm"
                variant="light"
                className="justify-start"
                color={hasNote ? 'primary' : 'secondary'}
                onPress={() => {
                  setIsPopoverOpen(false);
                  openNoteDrawer(date, 'day');
                }}
                startContent={
                  hasNote ? (
                    <NoteIcon size={16} weight="bold" />
                  ) : (
                    <NoteBlankIcon size={16} weight="bold" />
                  )
                }
              >
                {hasNote ? 'Edit note' : 'Add note'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        cellHeader
      )}
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
  );
};

export default MonthCalendarCell;
