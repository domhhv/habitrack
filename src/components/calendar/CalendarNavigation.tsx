import { useDisclosure, type Selection } from '@heroui/react';
import { cn, Button, Select, SelectItem, SelectSection } from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { FunnelSimpleIcon } from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { useLocation, useNavigate } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useScreenWidth, useDefaultFirstDayOfWeek } from '@hooks';
import {
  useUser,
  useProfile,
  useCalendarFilters,
  useCalendarFiltersChange,
} from '@stores';
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

  const { user } = useUser();
  const { isDesktop, isMobile } = useScreenWidth();
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
  const defaultFirstDayOfWeek = useDefaultFirstDayOfWeek();
  const profile = useProfile();
  const [weekSelectValue, setWeekSelectValue] = React.useState<Selection>(
    new Set([])
  );
  const weeks = React.useMemo(() => {
    return getWeeksOfYear(
      focusedDate.year,
      profile?.firstDayOfWeek || defaultFirstDayOfWeek
    );
  }, [focusedDate.year, profile?.firstDayOfWeek, defaultFirstDayOfWeek]);

  const calendarMode = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return pathSegments[1] || 'month';
  }, [location.pathname]);

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

  return (
    <div className="flex flex-col items-stretch justify-end gap-2 max-[445px]:gap-4 min-[446px]:flex-row lg:justify-between lg:gap-2">
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
        <CalendarNavigationButtons focusedDate={focusedDate} />
      </div>
    </div>
  );
};

export default CalendarNavigation;
