import { cn, Popover, Tooltip } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import { isToday, isEqualDay } from '@internationalized/date';
import {
  NoteIcon,
  NoteBlankIcon,
  SquareHalfIcon,
  CalendarPlusIcon,
  ArrowSquareRightIcon,
} from '@phosphor-icons/react';
import type { BorderBeamProps } from 'border-beam';
import BorderBeam from 'border-beam';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useCalendarCell } from 'react-aria';
import type { CalendarState } from 'react-stately';

import { CustomButton, OccurrenceChip } from '@components';
import { useThemeMode, useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import {
  useUser,
  useDayNotes,
  useNoteDrawerState,
  useNoteDrawerActions,
  useOccurrenceDrawerState,
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
  const user = useUser();
  const dayNotes = useDayNotes();
  const { openNoteDrawer } = useNoteDrawerActions();
  const {
    dayToDisplay,
    dayToLog,
    isOpen: isOccurrenceDrawerOpen,
    occurrenceToEdit,
  } = useOccurrenceDrawerState();
  const {
    isOpen: isNoteDrawerOpen,
    periodDate: noteDrawerPeriodDate,
    periodKind: noteDrawerPeriodKind,
  } = useNoteDrawerState();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const calendarCellRef = React.useRef<HTMLDivElement | null>(null);
  const { cellProps, formattedDate, isOutsideVisibleRange } = useCalendarCell(
    { date },
    state,
    calendarCellRef
  );
  const { themeMode } = useThemeMode();

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

  const occurrenceDrawerDate =
    occurrenceToEdit?.occurredAt || dayToLog || dayToDisplay;
  const isDrawerDate =
    (occurrenceDrawerDate &&
      isOccurrenceDrawerOpen &&
      isEqualDay(occurrenceDrawerDate, date)) ||
    (isNoteDrawerOpen &&
      noteDrawerPeriodKind === 'day' &&
      isEqualDay(noteDrawerPeriodDate, date));

  const openLoggingDrawer = () => {
    if (!user) {
      return;
    }

    openOccurrenceDrawer({
      dayToLog: date,
    });
  };

  const cellHeader = (
    <div
      className={cn(
        'border-border sticky top-0 flex w-full items-center justify-between border-b py-0.5 pr-0.5 pl-1.5 text-sm',
        'group-hover/cell:bg-background dark:group-hover/cell:bg-surface bg-white transition-colors dark:bg-black',
        isTodayCell &&
          'bg-background dark:bg-surface dark:group-hover/cell:bg-surface-secondary group-hover/cell:bg-background-secondary',
        isDrawerDate &&
          isDesktop &&
          !isTodayCell &&
          'bg-background dark:bg-surface',
        isDrawerDate &&
          isDesktop &&
          isTodayCell &&
          'bg-background-secondary dark:bg-surface-secondary',
        isOutsideVisibleRange && 'text-neutral-400 dark:text-neutral-600',
        isTodayCell ? 'w-full self-auto md:self-start' : 'w-full',
        isMobile && 'pl-1'
      )}
    >
      <p
        className={cn(
          'font-bold',
          isMobile && 'text-sm',
          isTodayCell && 'font-extrabold'
        )}
      >
        {formattedDate}
      </p>
      <div className="flex items-center justify-between">
        {isMobile && screenWidth > 360 && hasNote && (
          <NoteIcon size={12} weight="bold" />
        )}
        {screenWidth >= 1360 && (
          <div className="flex items-center">
            <Tooltip delay={0} closeDelay={0}>
              <Tooltip.Trigger className="flex">
                <CustomButton
                  variant="light"
                  aria-label="Open day"
                  href={`/calendar/day/${date.year}/${date.month}/${date.day}`}
                  className={cn(
                    'h-5 w-5 min-w-fit rounded-xl px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                    (isTodayCell || isDrawerDate) && 'opacity-100'
                  )}
                >
                  <ArrowSquareRightIcon size={18} weight="bold" />
                </CustomButton>
              </Tooltip.Trigger>
              <Tooltip.Content>Open day</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0} closeDelay={0}>
              <Tooltip.Trigger className="flex">
                <CustomButton
                  variant="light"
                  isDisabled={!user}
                  aria-label="Show habit log"
                  onPress={() => {
                    openOccurrenceDrawer({
                      dayToDisplay: date,
                    });
                  }}
                  className={cn(
                    'h-5 w-5 min-w-fit rounded-xl px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                    (isTodayCell || isDrawerDate) && 'opacity-100'
                  )}
                >
                  <SquareHalfIcon size={18} weight="bold" />
                </CustomButton>
              </Tooltip.Trigger>
              <Tooltip.Content>Show habit log</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0} closeDelay={0}>
              <Tooltip.Trigger className="flex">
                <CustomButton
                  variant="light"
                  isDisabled={!user}
                  aria-label="Log habit"
                  onPress={openLoggingDrawer}
                  className={cn(
                    'h-5 w-5 min-w-fit rounded-xl px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                    (isTodayCell || isDrawerDate) && 'opacity-100'
                  )}
                >
                  <CalendarPlusIcon size={18} weight="bold" />
                </CustomButton>
              </Tooltip.Trigger>
              <Tooltip.Content>Log habit</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0} closeDelay={0}>
              <Tooltip.Trigger className="flex">
                <CustomButton
                  variant="light"
                  isDisabled={!user}
                  aria-label={hasNote ? 'Edit note' : 'Add note'}
                  onPress={() => {
                    openNoteDrawer(date, 'day');
                  }}
                  className={cn(
                    'h-5 w-5 min-w-fit rounded-xl px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                    (isTodayCell || isDrawerDate) && 'opacity-100',
                    hasNote && 'text-accent opacity-100'
                  )}
                >
                  {hasNote ? (
                    <NoteIcon size={18} weight="bold" />
                  ) : (
                    <NoteBlankIcon size={18} weight="bold" />
                  )}
                </CustomButton>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {hasNote ? 'Edit note' : 'Add note'}
              </Tooltip.Content>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );

  const Component = isDrawerDate ? BorderBeam : 'div';

  const borderBeamProps: Omit<BorderBeamProps, 'children'> = {
    active: isDrawerDate,
    borderRadius: 0,
    size: 'pulse-inner',
    strength: 0.6,
    theme: themeMode === 'system' ? 'auto' : themeMode,
  };

  return (
    <div
      ref={calendarCellRef}
      {...cellProps}
      className="group/cell border-border flex h-auto flex-1 flex-col gap-2 rounded-none border-r-2 last-of-type:border-r-0 lg:h-36"
    >
      <Component
        {...(isDrawerDate && borderBeamProps)}
        className={cn(
          'group-hover/cell:bg-background dark:group-hover/cell:bg-surface relative flex-1 space-y-2 overflow-x-auto overflow-y-visible bg-white transition-colors dark:bg-black',
          isTodayCell &&
            'bg-background group-hover/cell:bg-surface-secondary dark:group-hover/cell:bg-surface-secondary dark:bg-surface',
          isDrawerDate &&
            isDesktop &&
            isTodayCell &&
            'bg-background-secondary dark:bg-surface-secondary z-52',
          isDrawerDate &&
            isDesktop &&
            !isTodayCell &&
            'bg-background dark:bg-surface z-52',
          position === 'top-left' && 'rounded-tl-[10px]!',
          position === 'top-right' && 'rounded-tr-[10px]!',
          position === 'bottom-left' && 'rounded-bl-[10px]!',
          position === 'bottom-right' && 'rounded-br-[10px]!'
        )}
      >
        {screenWidth < 1360 && user ? (
          <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <Popover.Trigger className="sticky top-0 z-10 w-full">
              {cellHeader}
            </Popover.Trigger>
            <Popover.Content offset={12} placement="bottom">
              <Popover.Dialog className="p-0">
                <Popover.Arrow />
                <div className="flex flex-col gap-1 p-1">
                  <CustomButton
                    size="sm"
                    variant="ghost"
                    className="justify-start gap-2"
                    href={`/calendar/day/${date.year}/${date.month}/${date.day}`}
                  >
                    <ArrowSquareRightIcon size={16} weight="bold" />
                    Open day
                  </CustomButton>
                  <CustomButton
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
                  </CustomButton>
                  <CustomButton
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
                  </CustomButton>
                  <CustomButton
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
                  </CustomButton>
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        ) : (
          cellHeader
        )}
        <div className="flex flex-wrap justify-center gap-2 px-0 py-0.5 pb-2 md:px-2 xl:justify-start">
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
      </Component>
    </div>
  );
};

export default MonthCalendarCell;
