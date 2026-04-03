import {
  cn,
  Label,
  Button,
  Header,
  Select,
  ListBox,
  useOverlayState,
} from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { FunnelSimpleIcon } from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { useLocation, useNavigate } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import { useUser, useCalendarFilters, useCalendarFiltersChange } from '@stores';
import { getWeeksOfYear } from '@utils';

import CalendarNavigationButtons from './CalendarNavigationButtons';

export type MonthCalendarNavigationProps = {
  className?: string;
  focusedDate: CalendarState['focusedDate'];
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const CalendarNavigation = ({
  className,
  focusedDate,
}: MonthCalendarNavigationProps) => {
  const timeZone = getLocalTimeZone();
  const filters = useCalendarFilters();
  const changeCalendarFilters = useCalendarFiltersChange();
  const location = useLocation();

  const user = useUser();
  const { isDesktop, isMobile } = useScreenWidth();
  const [monthSelectValue, setMonthSelectValue] = React.useState<string | null>(
    null
  );
  const [yearSelectValue, setYearSelectValue] = React.useState<string | null>(
    null
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
  const monthSelectState = useOverlayState();
  const yearSelectState = useOverlayState();
  const weekSelectState = useOverlayState();
  const navigate = useNavigate();
  const firstDayOfWeek = useFirstDayOfWeek();
  const [weekSelectValue, setWeekSelectValue] = React.useState<string | null>(
    null
  );
  const weeks = React.useMemo(() => {
    return getWeeksOfYear(focusedDate.year, firstDayOfWeek);
  }, [focusedDate.year, firstDayOfWeek]);

  const calendarMode = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return pathSegments[1] || 'month';
  }, [location.pathname]);

  React.useEffect(() => {
    setMonthSelectValue(String(focusedDate.month));
  }, [focusedDate.month]);

  React.useEffect(() => {
    setYearSelectValue(String(focusedDate.year));
  }, [focusedDate.year]);

  React.useEffect(() => {
    const weekIndex = weeks.findIndex((w) => {
      return (
        focusedDate.compare(w.startDate) >= 0 &&
        focusedDate.compare(w.endDate) <= 0
      );
    });

    if (weekIndex >= 0) {
      setWeekSelectValue(String(weekIndex));
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

  return (
    <div
      className={cn(
        'flex flex-col items-stretch justify-end gap-2 max-[445px]:gap-4 min-[446px]:flex-row lg:justify-between lg:gap-2',
        className
      )}
    >
      <div className="mr-0 flex items-stretch gap-2 lg:mr-2">
        <Select
          value={monthSelectValue}
          className="w-17.5 md:w-31.25"
          isOpen={monthSelectState.isOpen}
          onOpenChange={monthSelectState.setOpen}
          onChange={(newMonth) => {
            if (typeof newMonth === 'string') {
              navigateToMonth(focusedDate.year, Number(newMonth));
            }
          }}
        >
          <Label className="sr-only">Month</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="w-25 md:w-31.25">
            <ListBox>
              <ListBox.Section>
                <Header className="bg-default-100 shadow-small rounded-small sticky top-1 z-20 flex w-full px-2 py-1.5 pl-4">
                  Month
                </Header>
                {months.map((month, index) => {
                  return (
                    <ListBox.Item
                      id={String(index + 1)}
                      key={String(index + 1)}
                      textValue={capitalize(
                        isMobile ? month.substring(0, 3) : month
                      )}
                    >
                      {capitalize(isMobile ? month.substring(0, 3) : month)}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  );
                })}
              </ListBox.Section>
            </ListBox>
          </Select.Popover>
        </Select>
        <Select
          className="w-20"
          value={yearSelectValue}
          isOpen={yearSelectState.isOpen}
          onOpenChange={yearSelectState.setOpen}
          onChange={(newYear) => {
            if (typeof newYear === 'string') {
              navigateToMonth(Number(newYear), focusedDate.month);
            }
          }}
        >
          <Label className="sr-only">Year</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="w-25">
            <ListBox>
              <ListBox.Section>
                <Header className="bg-default-100 shadow-small rounded-small sticky top-1 z-20 flex w-full px-2 py-1.5 pl-4">
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
        {calendarMode === 'week' && (
          <Select
            value={weekSelectValue}
            className="w-37.5 md:w-62.5"
            isOpen={weekSelectState.isOpen}
            onOpenChange={weekSelectState.setOpen}
            onChange={(selectedIndex) => {
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
            <Label className="sr-only">Week</Label>
            <Select.Trigger>
              <Select.Value>
                {({ selectedText }) => {
                  return (
                    selectedText?.split(' ').slice(0, -1).join(' ') ||
                    'Select week'
                  );
                }}
              </Select.Value>
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="w-62.5">
              <ListBox>
                <ListBox.Section>
                  <Header className="bg-default-100 shadow-small rounded-small sticky top-1 z-20 flex w-full px-2 py-1.5 pl-4">
                    Week
                  </Header>
                  {weeks.map((week, index) => {
                    return (
                      <ListBox.Item
                        id={String(index)}
                        key={String(index)}
                        textValue={week.label}
                      >
                        {week.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    );
                  })}
                </ListBox.Section>
              </ListBox>
            </Select.Popover>
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
            variant="ghost"
            aria-label="Toggle filters"
            onPress={toggleFiltersVisibility}
            className={cn('rounded-sm', isMobile && 'min-w-fit p-0')}
          >
            <FunnelSimpleIcon size={20} />
          </Button>
        )}
        <CalendarNavigationButtons focusedDate={focusedDate} />
      </div>
    </div>
  );
};

export default CalendarNavigation;
