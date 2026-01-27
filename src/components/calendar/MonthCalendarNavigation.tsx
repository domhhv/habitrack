import { useDisclosure, type Selection } from '@heroui/react';
import { cn, Button, Select, SelectItem, SelectSection } from '@heroui/react';
import { today, isSameMonth } from '@internationalized/date';
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
import { useDateFormatter } from 'react-aria';
import { Link, useNavigate } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useScreenWidth } from '@hooks';
import { useNoteDrawerActions, useOccurrenceDrawerActions } from '@stores';

export type MonthCalendarNavigationProps = {
  isFilterToggleVisible: boolean;
  state: CalendarState;
  onToggleFilters: () => void;
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const MonthCalendarNavigation = ({
  isFilterToggleVisible,
  onToggleFilters,
  state,
}: MonthCalendarNavigationProps) => {
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
  const [monthSelectValue, setMonthSelectValue] = React.useState<Selection>(
    new Set([])
  );
  const [yearSelectValue, setYearSelectValue] = React.useState<Selection>(
    new Set([])
  );
  const formatter = useDateFormatter({
    month: 'long',
    timeZone: state.timeZone,
  });
  const months = React.useMemo(() => {
    return [
      ...Array(
        state.focusedDate.calendar.getMonthsInYear(state.focusedDate)
      ).keys(),
    ].map((i) => {
      const date = state.focusedDate.set({ month: i + 1 });

      return formatter.format(date.toDate(state.timeZone));
    });
  }, [formatter, state.focusedDate, state.timeZone]);
  const { nextMonth, prevMonth } = React.useMemo(() => {
    return {
      nextMonth: state.focusedDate.add({ months: 1 }).set({ day: 1 }),
      prevMonth: state.focusedDate.subtract({ months: 1 }).set({ day: 1 }),
    };
  }, [state.focusedDate]);
  const { isOpen: isMonthSelectOpen, onOpenChange: onMonthSelectOpenChange } =
    useDisclosure();
  const { isOpen: isYearSelectOpen, onOpenChange: onYearSelectOpenChange } =
    useDisclosure();
  const navigate = useNavigate();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();

  React.useEffect(() => {
    const newMonth = String(state.focusedDate.month);
    setMonthSelectValue(new Set([newMonth]));
  }, [state.focusedDate.month]);

  React.useEffect(() => {
    const newYear = String(state.focusedDate.year);
    setYearSelectValue(new Set([newYear]));
  }, [state.focusedDate.year]);

  const navigateToMonth = (year: number, month: number) => {
    navigate(`/calendar/month/${year}/${month}/1`);
  };

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
              dayToLog: today(state.timeZone),
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
            openNoteDrawer(today(state.timeZone), 'day');
          }}
        >
          <NotePencilIcon size={16} weight="bold" />
          Note
        </Button>
      </div>
      <div className="mr-0 flex items-stretch gap-2 lg:mr-2">
        {!isDesktop && isFilterToggleVisible && (
          <Button
            size="sm"
            isIconOnly
            radius="sm"
            variant="light"
            color="secondary"
            onPress={onToggleFilters}
            aria-label="Toggle filters"
            className={cn(isMobile && 'min-w-fit p-0')}
          >
            <FunnelSimpleIcon size={20} />
          </Button>
        )}
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
            base: 'w-[75px] md:w-[125px]',
            popoverContent: 'w-[100px] md:w-[125px]',
          }}
          onSelectionChange={(value) => {
            const [newMonth] = Array.from(value);

            if (typeof newMonth === 'string') {
              navigateToMonth(state.focusedDate.year, Number(newMonth));
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
          classNames={{
            base: 'w-[100px]',
          }}
          scrollShadowProps={{
            visibility: 'bottom',
          }}
          onSelectionChange={(value) => {
            const [newYear] = Array.from(value);

            if (typeof newYear === 'string') {
              navigateToMonth(Number(newYear), state.focusedDate.month);
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
      </div>
      <div className="flex gap-1 lg:gap-2">
        <Button
          as={Link}
          size="sm"
          isIconOnly
          radius="sm"
          variant="light"
          color="secondary"
          role="navigate-back"
          to={`/calendar/month/${prevMonth.year}/${prevMonth.month}/${prevMonth.day}`}
        >
          <ArrowFatLeftIcon size={20} />
        </Button>
        {!isSameMonth(state.focusedDate, today(state.timeZone)) && (
          <Button
            as={Link}
            size="sm"
            radius="sm"
            variant="light"
            color="secondary"
            className={cn(isMobile && 'min-w-fit p-0')}
            startContent={<ArrowsClockwiseIcon size={20} />}
            to={`/calendar/month/${today(state.timeZone).year}/${today(state.timeZone).month}/${today(state.timeZone).day}`}
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
          role="navigate-forward"
          to={`/calendar/month/${nextMonth.year}/${nextMonth.month}/${nextMonth.day}`}
        >
          <ArrowFatRightIcon size={20} />
        </Button>
      </div>
    </div>
  );
};

export default MonthCalendarNavigation;
