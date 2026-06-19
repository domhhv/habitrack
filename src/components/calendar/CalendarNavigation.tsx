import {
  cn,
  Link,
  Label,
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
import { useLocation } from 'react-router';
import type { CalendarState } from 'react-stately';

import { CustomButton } from '@components';
import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import { useUser, useCalendarFilters, useCalendarFiltersChange } from '@stores';
import { getWeeksOfYear } from '@utils';

import CalendarNavigationButtons from './CalendarNavigationButtons';

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
    month: isDesktop ? 'long' : 'short',
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
  const firstDayOfWeek = useFirstDayOfWeek();
  const focusedWeekStart = React.useMemo(() => {
    const targetDay = firstDayOfWeek === 'mon' ? 1 : 0;
    const dayOfWeek = focusedDate.toDate(timeZone).getDay();
    const daysToSubtract = (dayOfWeek - targetDay + 7) % 7;

    return focusedDate.subtract({ days: daysToSubtract });
  }, [focusedDate, firstDayOfWeek, timeZone]);
  const weeks = React.useMemo(() => {
    const anchorYear = focusedWeekStart.add({
      days: firstDayOfWeek === 'mon' ? 3 : 4,
    }).year;

    return getWeeksOfYear(anchorYear, firstDayOfWeek);
  }, [focusedWeekStart, firstDayOfWeek]);
  const selectedWeek = React.useMemo(() => {
    return weeks.find((week) => {
      return week.key === focusedWeekStart.toString();
    });
  }, [weeks, focusedWeekStart]);

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

  const toggleFiltersVisibility = () => {
    changeCalendarFilters({
      ...filters,
      isShownOnMobile: !filters.isShownOnMobile,
    });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-stretch justify-between gap-2">
        <div className="mr-0 flex items-stretch gap-2">
          <Select
            variant="secondary"
            value={monthSelectValue}
            className="w-17.5 md:w-28"
            isOpen={monthSelectState.isOpen}
            onOpenChange={monthSelectState.setOpen}
          >
            <Label className="sr-only">Month</Label>
            <Select.Trigger>
              <Select.Value
                render={() => {
                  return (
                    <span className="flex items-center gap-1">
                      {capitalize(
                        formatter.format(focusedDate.toDate(timeZone))
                      )}
                    </span>
                  );
                }}
              />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="w-25 md:w-31.25">
              <ListBox>
                <ListBox.Section>
                  <Header className="bg-default-100 shadow-small rounded-small sticky top-1 z-20 flex w-full px-2 py-1.5 pl-3">
                    Month
                  </Header>
                  {months.map((month, index) => {
                    return (
                      <ListBox.Item
                        className="p-0"
                        id={String(index + 1)}
                        key={String(index + 1)}
                        textValue={capitalize(month)}
                      >
                        <Link
                          className="flex w-full px-2.5 py-1.5 no-underline!"
                          href={`/calendar/${calendarMode}/${focusedDate.year}/${index + 1}/1`}
                        >
                          {capitalize(month)}
                          <ListBox.ItemIndicator />
                        </Link>
                      </ListBox.Item>
                    );
                  })}
                </ListBox.Section>
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            className="w-20"
            variant="secondary"
            value={yearSelectValue}
            isOpen={yearSelectState.isOpen}
            onOpenChange={yearSelectState.setOpen}
          >
            <Label className="sr-only">Year</Label>
            <Select.Trigger>
              <Select.Value
                render={() => {
                  return (
                    <span className="flex items-center gap-1">
                      {yearSelectValue}
                    </span>
                  );
                }}
              />
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
                        <Link
                          className="flex w-full px-2.5 py-1.5 no-underline!"
                          href={`/calendar/${calendarMode}/${year}/${focusedDate.month}/1`}
                        >
                          {year.toString()}
                          <ListBox.ItemIndicator />
                        </Link>
                      </ListBox.Item>
                    );
                  })}
                </ListBox.Section>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div
          className={cn(
            'flex gap-1 lg:gap-2',
            calendarMode === 'week' && 'justify-center'
          )}
        >
          {!isDesktop && !!user && (
            <CustomButton
              size="sm"
              isIconOnly
              variant="ghost"
              aria-label="Toggle filters"
              onPress={toggleFiltersVisibility}
              className={cn(isMobile && 'min-w-fit p-0')}
            >
              <FunnelSimpleIcon size={20} />
            </CustomButton>
          )}
          <CalendarNavigationButtons focusedDate={focusedDate} />
        </div>
      </div>
      {calendarMode === 'week' && (
        <Select
          variant="secondary"
          className="md:w-62.5"
          isOpen={weekSelectState.isOpen}
          value={selectedWeek?.key ?? null}
          onOpenChange={weekSelectState.setOpen}
        >
          <Label className="sr-only">Week</Label>
          <Select.Trigger>
            <Select.Value
              render={() => {
                return (
                  <span className="flex items-center gap-1">
                    {selectedWeek
                      ? selectedWeek.label.split(' ').slice(0, -1).join(' ')
                      : 'Select week'}
                  </span>
                );
              }}
            />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="w-62.5">
            <ListBox>
              <ListBox.Section>
                <Header className="bg-background shadow-small rounded-small sticky top-1 z-20 flex w-auto rounded-2xl px-2 py-1.5">
                  Week
                </Header>
                {weeks.map((week) => {
                  return (
                    <ListBox.Item
                      id={week.key}
                      key={week.key}
                      textValue={week.label}
                    >
                      <Link
                        className="flex w-full px-2.5 py-1.5 no-underline!"
                        href={`/calendar/week/${week.anchorDate.year}/${week.anchorDate.month}/${week.anchorDate.day}`}
                      >
                        {week.label}
                        <ListBox.ItemIndicator />
                      </Link>
                    </ListBox.Item>
                  );
                })}
              </ListBox.Section>
            </ListBox>
          </Select.Popover>
        </Select>
      )}
    </div>
  );
};

export default CalendarNavigation;
