import { useDisclosure, type Selection } from '@heroui/react';
import { cn, Button, Select, SelectItem, SelectSection } from '@heroui/react';
import {
  today,
  endOfWeek,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import {
  NotePencilIcon,
  ArrowFatLeftIcon,
  FunnelSimpleIcon,
  ArrowFatRightIcon,
  CalendarCheckIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useDateFormatter } from 'react-aria';
import { Link, useNavigate, useLocation } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import {
  useUser,
  useCalendarFilters,
  useNoteDrawerState,
  useNoteDrawerActions,
  useCalendarFiltersChange,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { getWeeksOfYear } from '@utils';

import useKeyboardShortcut from '../../hooks/use-keyboard-shortcut';

export type MonthCalendarNavigationProps = {
  focusedDate: CalendarState['focusedDate'];
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const CalendarNavigation = ({ focusedDate }: MonthCalendarNavigationProps) => {
  const timeZone = getLocalTimeZone();
  const filters = useCalendarFilters();
  const changeCalendarFilters = useCalendarFiltersChange();
  const occurrenceDrawerState = useOccurrenceDrawerState();
  const noteDrawerState = useNoteDrawerState();
  const location = useLocation();
  const { locale } = useLocale();
  const { user } = useUser();
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
  const [monthSelectValue, setMonthSelectValue] = React.useState<Selection>(
    new Set([])
  );
  const [yearSelectValue, setYearSelectValue] = React.useState<Selection>(
    new Set([])
  );
  const formatter = useDateFormatter({
    month: 'long',
  });
  const months = React.useMemo(() => {
    return [
      ...Array(focusedDate.calendar.getMonthsInYear(focusedDate)).keys(),
    ].map((i) => {
      const date = focusedDate.set({ month: i + 1 });

      return formatter.format(date.toDate(timeZone));
    });
  }, [formatter, focusedDate, timeZone]);
  const { isOpen: isMonthSelectOpen, onOpenChange: onMonthSelectOpenChange } =
    useDisclosure();
  const { isOpen: isYearSelectOpen, onOpenChange: onYearSelectOpenChange } =
    useDisclosure();
  const { isOpen: isWeekSelectOpen, onOpenChange: onWeekSelectOpenChange } =
    useDisclosure();
  const navigate = useNavigate();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { firstDayOfWeek } = useFirstDayOfWeek();
  const [weekSelectValue, setWeekSelectValue] = React.useState<Selection>(
    new Set([])
  );
  const weeks = React.useMemo(() => {
    return getWeeksOfYear(focusedDate.year, firstDayOfWeek);
  }, [focusedDate.year, firstDayOfWeek]);

  const calendarMode = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return pathSegments[1] || 'month';
  }, [location.pathname]);

  const [previousRangePath, nextRangePath] = React.useMemo(() => {
    const toSet = {
      months: calendarMode === 'month' ? 1 : 0,
      weeks: calendarMode === 'week' ? 1 : 0,
    };

    const previousRange = focusedDate
      .subtract(toSet)
      .toString()
      .split('-')
      .map(Number)
      .join('/');

    const nextRange = focusedDate
      .add(toSet)
      .toString()
      .split('-')
      .map(Number)
      .join('/');

    return [
      `/calendar/${calendarMode}/${previousRange}`,
      `/calendar/${calendarMode}/${nextRange}`,
    ];
  }, [focusedDate, calendarMode]);

  useKeyboardShortcut(
    'ArrowLeft',
    () => {
      navigate(previousRangePath);
    },
    { enabled: !occurrenceDrawerState.isOpen && !noteDrawerState.isOpen }
  );

  useKeyboardShortcut(
    'ArrowRight',
    () => {
      navigate(nextRangePath);
    },
    { enabled: !occurrenceDrawerState.isOpen && !noteDrawerState.isOpen }
  );

  React.useEffect(() => {
    const newMonth = String(focusedDate.month);
    setMonthSelectValue(new Set([newMonth]));
  }, [focusedDate.month]);

  React.useEffect(() => {
    const newYear = String(focusedDate.year);
    setYearSelectValue(new Set([newYear]));
  }, [focusedDate.year]);

  React.useEffect(() => {
    const weekIndex = weeks.findIndex((w) => {
      return (
        focusedDate.compare(w.startDate) >= 0 &&
        focusedDate.compare(w.endDate) <= 0
      );
    });

    if (weekIndex >= 0) {
      setWeekSelectValue(new Set([String(weekIndex)]));
    }
  }, [focusedDate, weeks]);

  const navigateToMonth = (year: number, month: number) => {
    navigate(`/calendar/${calendarMode}/${year}/${month}/1`);
  };

  const toggleFiltersVisibility = () => {
    changeCalendarFilters({
      ...filters,
      isShownOnMobile: !filters.isShownOnMobile,
    });
  };

  const isSameRange = React.useMemo(() => {
    const todayDate = today(timeZone);

    if (calendarMode === 'month') {
      return isSameMonth(focusedDate, today(timeZone));
    }

    const weekStart = startOfWeek(focusedDate, locale, firstDayOfWeek);
    const weekEnd = endOfWeek(focusedDate, locale, firstDayOfWeek);

    return todayDate.compare(weekStart) >= 0 && todayDate.compare(weekEnd) <= 0;
  }, [calendarMode, focusedDate, firstDayOfWeek, timeZone, locale]);

  const todayRangePath = React.useMemo(() => {
    const todayDate = today(timeZone);

    if (calendarMode === 'month') {
      return `/calendar/month/${todayDate.year}/${todayDate.month}/${
        startOfMonth(todayDate).day
      }`;
    }

    const weekStart = startOfWeek(todayDate, locale, firstDayOfWeek).add({
      days: firstDayOfWeek === 'sun' ? 4 : 3,
    });

    return `/calendar/week/${weekStart.year}/${weekStart.month}/${
      weekStart.day
    }`;
  }, [calendarMode, timeZone, locale, firstDayOfWeek]);

  return (
    <div className="flex flex-col items-stretch justify-end gap-2 max-[445px]:gap-4 min-[446px]:flex-row lg:justify-between lg:gap-2">
      <div className="flex w-full gap-2">
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          className="h-6 w-1/2 md:hidden"
          onPress={() => {
            openOccurrenceDrawer({
              dayToLog: today(timeZone),
            });
          }}
        >
          <CalendarCheckIcon size={16} weight="bold" />
          Log
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          className="h-6 w-1/2 md:hidden"
          onPress={() => {
            openNoteDrawer(today(timeZone), 'day');
          }}
        >
          <NotePencilIcon size={16} weight="bold" />
          Note
        </Button>
      </div>
      <div className="mr-0 flex items-stretch gap-2 lg:mr-2">
        <Select
          size="sm"
          radius="sm"
          color="secondary"
          variant="bordered"
          isOpen={isMonthSelectOpen}
          selectedKeys={monthSelectValue}
          onOpenChange={onMonthSelectOpenChange}
          scrollShadowProps={{
            visibility: 'bottom',
          }}
          classNames={{
            base: 'w-[70px] md:w-[125px]',
            popoverContent: 'w-[100px] md:w-[125px]',
          }}
          onSelectionChange={(value) => {
            const [newMonth] = Array.from(value);

            if (typeof newMonth === 'string') {
              navigateToMonth(focusedDate.year, Number(newMonth));
            }
          }}
        >
          <SelectSection
            title="Month"
            classNames={{
              heading:
                'flex w-full sticky top-1 z-20 py-1.5 px-2 pl-4 bg-default-100 shadow-small rounded-small',
            }}
          >
            {months.map((month, index) => {
              return (
                <SelectItem key={String(index + 1)}>
                  {capitalize(isMobile ? month.substring(0, 3) : month)}
                </SelectItem>
              );
            })}
          </SelectSection>
        </Select>
        <Select
          size="sm"
          radius="sm"
          color="secondary"
          variant="bordered"
          isOpen={isYearSelectOpen}
          selectedKeys={yearSelectValue}
          onOpenChange={onYearSelectOpenChange}
          scrollShadowProps={{
            visibility: 'bottom',
          }}
          classNames={{
            base: 'w-[80px]',
            popoverContent: 'w-[100px]',
          }}
          onSelectionChange={(value) => {
            const [newYear] = Array.from(value);

            if (typeof newYear === 'string') {
              navigateToMonth(Number(newYear), focusedDate.month);
            }
          }}
        >
          <SelectSection
            title="Year"
            classNames={{
              heading:
                'flex w-full sticky top-1 z-20 py-1.5 px-2 pl-4 bg-default-100 shadow-small rounded-small',
            }}
          >
            {YEARS.map((year) => {
              return (
                <SelectItem key={year.toString()}>{year.toString()}</SelectItem>
              );
            })}
          </SelectSection>
        </Select>
        {calendarMode === 'week' && (
          <Select
            size="sm"
            radius="sm"
            color="secondary"
            variant="bordered"
            isVirtualized={false}
            isOpen={isWeekSelectOpen}
            selectedKeys={weekSelectValue}
            onOpenChange={onWeekSelectOpenChange}
            scrollShadowProps={{
              visibility: 'bottom',
            }}
            classNames={{
              base: 'w-[150px] md:w-[250px]',
              popoverContent: 'w-[250px]',
            }}
            renderValue={([selectedValue]) => {
              return (
                selectedValue.textValue?.split(' ').slice(0, -1).join(' ') ||
                'Select week'
              );
            }}
            onSelectionChange={(value) => {
              const [selectedIndex] = Array.from(value);

              if (typeof selectedIndex === 'string') {
                const week = weeks[Number(selectedIndex)];

                if (week) {
                  const { startDate } = week;
                  navigate(
                    `/calendar/week/${startDate.year}/${startDate.month}/${startDate.day}`
                  );
                }
              }
            }}
          >
            <SelectSection
              title="Week"
              classNames={{
                heading:
                  'flex w-full sticky top-1 z-20 py-1.5 px-2 pl-4 bg-default-100 shadow-small rounded-small',
              }}
            >
              {weeks.map((week, index) => {
                return (
                  <SelectItem key={String(index)}>{week.label}</SelectItem>
                );
              })}
            </SelectSection>
          </Select>
        )}
      </div>
      <div
        className={cn(
          'flex gap-1 lg:gap-2',
          calendarMode === 'week' && 'justify-center'
        )}
      >
        {!isDesktop && !!user && (
          <Button
            size="sm"
            isIconOnly
            radius="sm"
            variant="light"
            color="secondary"
            aria-label="Toggle filters"
            onPress={toggleFiltersVisibility}
            className={cn(isMobile && 'min-w-fit p-0')}
          >
            <FunnelSimpleIcon size={20} />
          </Button>
        )}
        <Button
          as={Link}
          size="sm"
          isIconOnly
          radius="sm"
          variant="light"
          color="secondary"
          role="navigate-back"
          to={previousRangePath}
        >
          <ArrowFatLeftIcon size={20} />
        </Button>
        {!isSameRange && (
          <Button
            as={Link}
            size="sm"
            radius="sm"
            variant="light"
            color="secondary"
            to={todayRangePath}
            className={cn(isMobile && 'min-w-fit p-0')}
            startContent={<ArrowsClockwiseIcon size={20} />}
          >
            {(!isMobile || screenWidth < 446) && 'Today'}
          </Button>
        )}
        <Button
          as={Link}
          size="sm"
          isIconOnly
          radius="sm"
          variant="light"
          color="secondary"
          to={nextRangePath}
          role="navigate-forward"
        >
          <ArrowFatRightIcon size={20} />
        </Button>
      </div>
    </div>
  );
};

export default CalendarNavigation;
