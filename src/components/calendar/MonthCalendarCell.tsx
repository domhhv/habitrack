import { cn, Button, Popover, Tooltip } from '@heroui/react';
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
import groupBy from 'lodash.groupby';
import React from 'react';
import { useCalendarCell } from 'react-aria';
import { useNavigate } from 'react-router';
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
    occurrences.slice().sort((l, r) => {
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
            <Tooltip closeDelay={0}>
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  aria-label="Open day"
                  className="h-5 w-5 min-w-fit rounded-sm px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
                  onPress={() => {
                    navigate(
                      `/calendar/day/${date.year}/${date.month}/${date.day}`
                    );
                  }}
                >
                  <ArrowSquareRightIcon size={18} weight="bold" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Open day</Tooltip.Content>
            </Tooltip>
            <Tooltip closeDelay={0}>
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  isDisabled={!user}
                  aria-label="Show habit log"
                  className="h-5 w-5 min-w-fit rounded-sm px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
                  onPress={() => {
                    openOccurrenceDrawer({
                      dayToDisplay: date,
                    });
                  }}
                >
                  <SquareHalfIcon size={18} weight="bold" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Show habit log</Tooltip.Content>
            </Tooltip>
            <Tooltip closeDelay={0}>
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  isDisabled={!user}
                  aria-label="Log habit"
                  onPress={openLoggingDrawer}
                  className="h-5 w-5 min-w-fit rounded-sm px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6"
                >
                  <CalendarPlusIcon size={18} weight="bold" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Log habit</Tooltip.Content>
            </Tooltip>
            <Tooltip closeDelay={0}>
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  isDisabled={!user}
                  aria-label={hasNote ? 'Edit note' : 'Add note'}
                  onPress={() => {
                    openNoteDrawer(date, 'day');
                  }}
                  className={cn(
                    'h-5 w-5 min-w-fit rounded-sm px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                    hasNote && 'text-accent opacity-100'
                  )}
                >
                  {hasNote ? (
                    <NoteIcon size={18} weight="bold" />
                  ) : (
                    <NoteBlankIcon size={18} weight="bold" />
                  )}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {hasNote ? 'Edit note' : 'Add note'}
              </Tooltip.Content>
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
        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <Popover.Trigger>{cellHeader}</Popover.Trigger>
          <Popover.Content offset={4} placement="bottom">
            <Popover.Dialog>
              <div className="flex flex-col gap-1 p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-start"
                  onPress={() => {
                    setIsPopoverOpen(false);
                    navigate(
                      `/calendar/day/${date.year}/${date.month}/${date.day}`
                    );
                  }}
                >
                  <ArrowSquareRightIcon size={16} weight="bold" />
                  Open day
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-start"
                  onPress={() => {
                    setIsPopoverOpen(false);
                    openOccurrenceDrawer({
                      dayToDisplay: date,
                    });
                  }}
                >
                  <SquareHalfIcon size={16} weight="bold" />
                  Show habit log
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-start"
                  onPress={() => {
                    setIsPopoverOpen(false);
                    openLoggingDrawer();
                  }}
                >
                  <CalendarPlusIcon size={16} weight="bold" />
                  Log habit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn('justify-start', hasNote && 'text-accent')}
                  onPress={() => {
                    setIsPopoverOpen(false);
                    openNoteDrawer(date, 'day');
                  }}
                >
                  {hasNote ? (
                    <NoteIcon size={16} weight="bold" />
                  ) : (
                    <NoteBlankIcon size={16} weight="bold" />
                  )}
                  {hasNote ? 'Edit note' : 'Add note'}
                </Button>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      ) : (
        cellHeader
      )}
      <div className="flex flex-wrap justify-center gap-2 overflow-x-auto overflow-y-visible px-0 py-0.5 pb-2 md:justify-start md:px-2">
        {Object.entries(groupedOccurrences).map(
          ([habitId, habitOccurrences]) => {
            if (!habitOccurrences) {
              return null;
            }

            return (
              <OccurrenceChip key={habitId} occurrences={habitOccurrences} />
            );
          }
        )}
      </div>
    </div>
  );
};

export default MonthCalendarCell;
