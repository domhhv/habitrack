import type { Key } from '@heroui/react';
import {
  cn,
  Badge,
  Label,
  Header,
  Select,
  ListBox,
  Tooltip,
} from '@heroui/react';
import {
  today,
  isSameDay,
  isSameMonth,
  startOfWeek,
  CalendarDate,
  getWeeksInMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import type { Icon } from '@phosphor-icons/react';
import { PhoneCallIcon } from '@phosphor-icons/react';
import {
  CoffeeIcon,
  HamburgerIcon,
  NoteBlankIcon,
  SneakerMoveIcon,
  BookOpenTextIcon,
  ArrowFatLeftIcon,
  CalendarPlusIcon,
  ArrowFatRightIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import React from 'react';

import { CustomButton } from '@components';

type CellPosition =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | '';

type DemoHabit = {
  chance: number;
  color: string;
  icon: Icon;
  id: string;
  name: string;
};

const LOCALE = 'en-US';
const FIRST_DAY_OF_WEEK = 'mon';
const INITIAL_MONTH = new CalendarDate(2026, 7, 1);

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEARS = Array.from({ length: 11 }, (_, i) => {
  return 2020 + i;
});

const DEMO_HABITS: DemoHabit[] = [
  {
    chance: 0.8,
    color: 'var(--warning)',
    icon: CoffeeIcon,
    id: 'coffee',
    name: 'Coffee',
  },
  {
    chance: 0.5,
    color: 'var(--accent)',
    icon: SneakerMoveIcon,
    id: 'running',
    name: 'Running',
  },
  {
    chance: 0.4,
    color: '#00B8DA',
    icon: PhoneCallIcon,
    id: 'phone',
    name: 'Call parents',
  },
  {
    chance: 0.35,
    color: '#60a5fa',
    icon: BookOpenTextIcon,
    id: 'reading',
    name: 'Reading',
  },
  {
    chance: 0.2,
    color: 'var(--danger)',
    icon: HamburgerIcon,
    id: 'snacks',
    name: 'Late snacks',
  },
];

/*
 * Deterministic integer hash so the prerendered markup and the hydrated
 * client render produce identical stub occurrences for a given date.
 */
const seededFraction = (date: CalendarDate, salt: number) => {
  let hash = date.year * 373 + date.month * 37 + date.day + salt * 4241;

  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  hash ^= hash >>> 16;

  return (hash >>> 0) / 4294967296;
};

const stubOccurrencesForDay = (date: CalendarDate) => {
  return DEMO_HABITS.flatMap((habit, index) => {
    if (seededFraction(date, index) >= habit.chance) {
      return [];
    }

    const count =
      habit.id === 'coffee' && seededFraction(date, index + 10) < 0.35 ? 2 : 1;

    return [{ count, habit }];
  });
};

type LiveOccurrenceChipProps = {
  count: number;
  habit: DemoHabit;
};

const LiveOccurrenceChip = ({ count, habit }: LiveOccurrenceChipProps) => {
  const HabitIcon = habit.icon;

  let chip = (
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger>
        <div
          tabIndex={0}
          role="button"
          style={{ borderColor: habit.color }}
          className="relative rounded-2xl border-2 bg-white p-1 dark:bg-black"
        >
          <HabitIcon size={14} weight="bold" />
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content className="px-2 py-1.5">{habit.name}</Tooltip.Content>
    </Tooltip>
  );

  if (count > 1) {
    chip = (
      <Badge.Anchor>
        {chip}
        <Badge
          size="sm"
          color="accent"
          variant="primary"
          placement="bottom-right"
        >
          {count}
        </Badge>
      </Badge.Anchor>
    );
  }

  return chip;
};

type LiveCalendarCellProps = {
  date: CalendarDate;
  isOutsideVisibleMonth: boolean;
  isTodayCell: boolean;
  position: CellPosition;
};

const LiveCalendarCell = ({
  date,
  isOutsideVisibleMonth,
  isTodayCell,
  position,
}: LiveCalendarCellProps) => {
  const occurrences =
    today(getLocalTimeZone()).compare(date) >= 0
      ? stubOccurrencesForDay(date)
      : [];

  const cellHeader = (
    <div
      className={cn(
        'border-border sticky top-0 flex w-full items-center justify-between border-b py-0.5 pr-0.5 pl-1.5 text-sm',
        'group-hover/cell:bg-background dark:group-hover/cell:bg-surface bg-white transition-colors dark:bg-black',
        isTodayCell &&
          'bg-background dark:bg-surface dark:group-hover/cell:bg-surface-secondary group-hover/cell:bg-background-secondary',
        isOutsideVisibleMonth && 'text-neutral-400 dark:text-neutral-600'
      )}
    >
      <p className={cn('font-bold', isTodayCell && 'font-extrabold')}>
        {date.day}
      </p>
      <div className="hidden items-center lg:flex">
        <Tooltip delay={0} closeDelay={0}>
          <Tooltip.Trigger className="flex">
            <CustomButton
              variant="light"
              aria-label="Log habit"
              className={cn(
                'h-5 w-5 min-w-fit rounded-xl px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100',
                isTodayCell && 'opacity-100'
              )}
            >
              <CalendarPlusIcon size={14} weight="bold" />
            </CustomButton>
          </Tooltip.Trigger>
          <Tooltip.Content>Log habit</Tooltip.Content>
        </Tooltip>
        <Tooltip delay={0} closeDelay={0}>
          <Tooltip.Trigger className="flex">
            <CustomButton
              variant="light"
              aria-label="Add note"
              className={cn(
                'h-5 w-5 min-w-fit rounded-xl px-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100',
                isTodayCell && 'opacity-100'
              )}
            >
              <NoteBlankIcon size={14} weight="bold" />
            </CustomButton>
          </Tooltip.Trigger>
          <Tooltip.Content>Add note</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <div className="group/cell border-border flex h-auto flex-1 flex-col gap-2 rounded-none border-r-2 last-of-type:border-r-0 lg:h-24">
      <div
        className={cn(
          'group-hover/cell:bg-background dark:group-hover/cell:bg-surface relative flex-1 space-y-2 overflow-x-auto overflow-y-visible bg-white transition-colors dark:bg-black',
          isTodayCell &&
            'bg-background group-hover/cell:bg-surface-secondary dark:group-hover/cell:bg-surface-secondary dark:bg-surface',
          position === 'top-left' && 'rounded-tl-[10px]!',
          position === 'top-right' && 'rounded-tr-[10px]!',
          position === 'bottom-left' && 'rounded-bl-[10px]!',
          position === 'bottom-right' && 'rounded-br-[10px]!'
        )}
      >
        {cellHeader}
        <div className="flex flex-wrap justify-center gap-2 px-0 py-0.5 pb-2 md:px-1">
          {occurrences.map(({ count, habit }) => {
            return (
              <LiveOccurrenceChip count={count} habit={habit} key={habit.id} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LiveMonthCalendar = () => {
  /*
   * The landing page is prerendered at build time, so the first render uses a
   * fixed anchor month and switches to the visitor's current month only after
   * hydration to keep the server and client markup identical.
   */
  const [focusedDate, setFocusedDate] = React.useState(INITIAL_MONTH);
  const [currentDate, setCurrentDate] = React.useState<CalendarDate | null>(
    null
  );

  React.useEffect(() => {
    const now = today(getLocalTimeZone());

    setCurrentDate(now);
    setFocusedDate(now.set({ day: 1 }));
  }, []);

  const monthStart = focusedDate.set({ day: 1 });
  const gridStart = startOfWeek(monthStart, LOCALE, FIRST_DAY_OF_WEEK);
  const weeksInMonthCount = getWeeksInMonth(
    monthStart,
    LOCALE,
    FIRST_DAY_OF_WEEK
  );
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];

  const getDatesInWeek = (weekIndex: number) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      return gridStart.add({ days: weekIndex * 7 + dayIndex });
    });
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

  const handleMonthChange = (value: Key | Key[] | null) => {
    if (value === null || Array.isArray(value)) {
      return;
    }

    setFocusedDate(focusedDate.set({ month: Number(value) }));
  };

  const handleYearChange = (value: Key | Key[] | null) => {
    if (value === null || Array.isArray(value)) {
      return;
    }

    setFocusedDate(focusedDate.set({ year: Number(value) }));
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-4 shadow-xl">
      <div className="flex justify-between gap-2">
        <div className="mr-0 flex items-stretch gap-2">
          <Select
            variant="secondary"
            className="select--sm w-28"
            onChange={handleMonthChange}
            value={String(focusedDate.month)}
          >
            <Label className="sr-only">Month</Label>
            <Select.Trigger>
              <Select.Value
                render={() => {
                  return (
                    <span className="flex items-center gap-1">
                      {MONTH_LABELS[focusedDate.month - 1]}
                    </span>
                  );
                }}
              />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="w-31.25">
              <ListBox>
                <ListBox.Section>
                  <Header className="bg-background text-background-inverse shadow-small rounded-small sticky top-1 z-20 flex w-full rounded-3xl px-2 py-1.5 pl-4">
                    Month
                  </Header>
                  {MONTH_LABELS.map((month, index) => {
                    return (
                      <ListBox.Item
                        textValue={month}
                        id={String(index + 1)}
                        key={String(index + 1)}
                      >
                        {month}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    );
                  })}
                </ListBox.Section>
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            variant="secondary"
            onChange={handleYearChange}
            className="select--sm w-20"
            value={String(focusedDate.year)}
          >
            <Label className="sr-only">Year</Label>
            <Select.Trigger>
              <Select.Value
                render={() => {
                  return (
                    <span className="flex items-center gap-1">
                      {focusedDate.year}
                    </span>
                  );
                }}
              />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="w-28">
              <ListBox>
                <ListBox.Section>
                  <Header className="bg-background text-background-inverse shadow-small rounded-small sticky top-1 z-20 flex w-full rounded-3xl px-2 py-1.5 pl-4">
                    Year
                  </Header>
                  {YEARS.map((year) => {
                    return (
                      <ListBox.Item
                        id={year.toString()}
                        key={year.toString()}
                        textValue={year.toString()}
                      >
                        {year.toString()}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    );
                  })}
                </ListBox.Section>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div className="flex gap-1">
          <CustomButton
            size="sm"
            className="px-3"
            variant="tertiary"
            aria-label="Previous month"
            onPress={() => {
              setFocusedDate(focusedDate.subtract({ months: 1 }));
            }}
          >
            <ArrowFatLeftIcon size={20} />
          </CustomButton>
          {currentDate && !isSameMonth(focusedDate, currentDate) && (
            <CustomButton
              size="sm"
              className="px-3"
              variant="tertiary"
              aria-label="Current month"
              onPress={() => {
                setFocusedDate(currentDate.set({ day: 1 }));
              }}
            >
              <ArrowsClockwiseIcon size={20} />
            </CustomButton>
          )}
          <CustomButton
            size="sm"
            className="px-3"
            variant="tertiary"
            aria-label="Next month"
            onPress={() => {
              setFocusedDate(focusedDate.add({ months: 1 }));
            }}
          >
            <ArrowFatRightIcon size={20} />
          </CustomButton>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-0">
        <div className="mb-1 flex">
          {WEEKDAY_LABELS.map((weekDay) => {
            return (
              <div
                key={weekDay}
                className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
              >
                <p className="text-xs font-bold">{weekDay}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-1 flex-col">
          {weekIndexes.map((weekIndex) => {
            return (
              <div key={weekIndex} className="group relative flex items-end">
                <div
                  className={cn(
                    'border-border flex h-20 w-full basis-full justify-between border-r-2 border-l-2 group-first-of-type:border-t-2 last-of-type:border-b-2 lg:h-auto',
                    weekIndex === 0 && 'rounded-t-3xl',
                    weekIndex === weeksInMonthCount - 1 && 'rounded-b-3xl'
                  )}
                >
                  {getDatesInWeek(weekIndex).map((calendarDate, dayIndex) => {
                    return (
                      <LiveCalendarCell
                        date={calendarDate}
                        key={calendarDate.toString()}
                        position={getCellPosition(weekIndex, dayIndex)}
                        isOutsideVisibleMonth={
                          !isSameMonth(calendarDate, monthStart)
                        }
                        isTodayCell={
                          !!currentDate && isSameDay(calendarDate, currentDate)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveMonthCalendar;
