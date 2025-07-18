import type { SelectedItems } from '@heroui/react';
import {
  cn,
  Button,
  Select,
  Tooltip,
  SelectItem,
  SelectSection,
} from '@heroui/react';
import {
  ArrowFatLeft,
  ArrowFatRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { addMonths, startOfMonth, startOfToday } from 'date-fns';
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router';

import { TraitChip, CrossPlatformHorizontalScroll } from '@components';
import { useUser, useScreenWidth } from '@hooks';
import type { Habit, Trait, OccurrenceFilters } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useHabits, useTraits } from '@stores';

export type MonthCalendarHeaderProps = {
  activeMonthLabel: string;
  activeYear: string;
  filters: OccurrenceFilters;
  months: string[];
  onFilterChange: (filters: OccurrenceFilters) => void;
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const MonthCalendarHeader = ({
  activeMonthLabel,
  activeYear,
  filters,
  months,
  onFilterChange,
}: MonthCalendarHeaderProps) => {
  const habits = useHabits();
  const traits = useTraits();
  const { user } = useUser();
  const { isMobile, screenWidth } = useScreenWidth();
  const isOnCurrentMonth =
    activeMonthLabel === months[new Date().getMonth()] &&
    activeYear === new Date().getFullYear().toString();
  const { day, month, year } = useParams();
  const navigate = useNavigate();

  const focusedDate = React.useMemo(() => {
    if (!year || !month || !day) {
      return new Date();
    }

    return new Date(Number(year), Number(month) - 1, Number(day));
  }, [year, month, day]);

  const prevMonth = startOfMonth(addMonths(focusedDate, -1));
  const nextMonth = startOfMonth(addMonths(focusedDate, 1));
  const today = startOfToday();

  const shouldRenderFilters =
    !!user && Object.keys(habits).length > 0 && Object.keys(traits).length > 0;

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(Object.values(habits), (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

  const handleMonthChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    navigate(
      `/calendar/month/${focusedDate.getFullYear()}/${months.indexOf(event.target.value) + 1}/${focusedDate.getDate()}`
    );
  };

  const handleYearChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    navigate(
      `/calendar/month/${event.target.value}/${focusedDate.getMonth() + 1}/${focusedDate.getDate()}`
    );
  };

  const handleHabitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    onFilterChange({
      ...filters,
      habitIds: new Set(event.target.value.split(',')),
    });
  };

  const handleTraitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    onFilterChange({
      ...filters,
      traitIds: new Set(event.target.value.split(',')),
    });
  };

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 px-0 pt-2 md:pt-0 lg:flex-row lg:gap-0 lg:px-0">
      <div className="flex flex-col items-stretch justify-end gap-0 max-[372px]:gap-4 min-[373px]:flex-row lg:justify-between lg:gap-2">
        <div className="mr-0 flex items-stretch gap-2 lg:mr-2">
          <Select
            radius="sm"
            label="Month"
            color="secondary"
            variant="bordered"
            onChange={handleMonthChange}
            selectedKeys={new Set([activeMonthLabel])}
            classNames={{
              base: 'w-[100px]',
              popoverContent: 'w-[125px]',
            }}
          >
            {months.map((month) => {
              return (
                <SelectItem key={month}>
                  {isMobile ? month.substring(0, 3) : month}
                </SelectItem>
              );
            })}
          </Select>
          <Select
            radius="sm"
            label="Year"
            color="secondary"
            variant="bordered"
            onChange={handleYearChange}
            selectedKeys={new Set([activeYear])}
            classNames={{
              base: 'w-[100px]',
            }}
          >
            {YEARS.map((year) => {
              return (
                <SelectItem as={Link} key={year.toString()}>
                  {year.toString()}
                </SelectItem>
              );
            })}
          </Select>
        </div>
        <div className="flex items-stretch gap-0 lg:gap-2">
          <Button
            as={Link}
            size="md"
            isIconOnly
            radius="sm"
            variant="light"
            color="secondary"
            className="h-auto"
            role="navigate-back"
            to={`/calendar/month/${prevMonth.getFullYear()}/${prevMonth.getMonth() + 1}/${prevMonth.getDate()}`}
          >
            <ArrowFatLeft size={20} />
          </Button>
          {!isOnCurrentMonth && (
            <Button
              as={Link}
              size="md"
              radius="sm"
              variant="light"
              color="secondary"
              startContent={<ArrowsClockwise size={20} />}
              className={cn('h-auto', isMobile && 'min-w-fit p-0')}
              to={`/calendar/month/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`}
            >
              {(!isMobile || screenWidth < 373) && 'Today'}
            </Button>
          )}
          <Button
            as={Link}
            size="md"
            isIconOnly
            radius="sm"
            variant="light"
            color="secondary"
            className="h-auto"
            role="navigate-forward"
            to={`/calendar/month/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/${nextMonth.getDate()}`}
          >
            <ArrowFatRight size={20} />
          </Button>
        </div>
      </div>
      {shouldRenderFilters && (
        <div className="flex flex-col items-stretch justify-end gap-2 min-[450px]:flex-row lg:justify-between">
          <Select
            radius="sm"
            color="secondary"
            variant="bordered"
            label="Filter by habits"
            selectionMode="multiple"
            selectedKeys={filters.habitIds}
            className="w-full md:w-[200px]"
            onChange={handleHabitsFilterChange}
            scrollShadowProps={{
              visibility: 'bottom',
            }}
            popoverProps={{
              crossOffset: isMobile ? -75 : 0,
            }}
            renderValue={(selectedHabits: SelectedItems<Habit>) => {
              return (
                <CrossPlatformHorizontalScroll className="flex space-x-2">
                  {selectedHabits.map(({ key }) => {
                    if (typeof key !== 'string' || !habits[key]) {
                      return null;
                    }

                    const { iconPath, id, name } = habits[key];

                    return (
                      <Tooltip key={id} content={name}>
                        <img
                          className="h-4 w-4"
                          alt={`${name} icon`}
                          src={getPublicUrl(
                            StorageBuckets.HABIT_ICONS,
                            iconPath
                          )}
                        />
                      </Tooltip>
                    );
                  })}
                </CrossPlatformHorizontalScroll>
              );
            }}
          >
            {Object.entries(habitsByTraitName).map(([traitName, habits]) => {
              return (
                <SelectSection
                  showDivider
                  key={traitName}
                  title={traitName}
                  classNames={{
                    heading:
                      'flex w-full sticky top-1 z-20 py-1.5 px-2 pl-4 bg-default-100 shadow-small rounded-small',
                  }}
                >
                  {habits!.map((habit) => {
                    return (
                      <SelectItem key={habit.id} textValue={habit.name}>
                        <div className="flex items-center gap-2">
                          <img
                            alt={habit.name}
                            role="habit-icon"
                            className="h-4 w-4"
                            src={getPublicUrl(
                              StorageBuckets.HABIT_ICONS,
                              habit.iconPath
                            )}
                          />
                          <span className="truncate">{habit.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectSection>
              );
            })}
          </Select>
          <Select
            size="md"
            radius="sm"
            color="secondary"
            variant="bordered"
            label="Filter by traits"
            selectionMode="multiple"
            selectedKeys={filters.traitIds}
            className="w-full md:w-[250px]"
            onChange={handleTraitsFilterChange}
            renderValue={(selectedTraits: SelectedItems<Trait>) => {
              return (
                <CrossPlatformHorizontalScroll className="space-x-2">
                  {selectedTraits.map(({ key }) => {
                    if (typeof key !== 'string' || !traits[key]) {
                      return null;
                    }

                    const { color, id, name } = traits[key];

                    return <TraitChip key={id} trait={{ color, name }} />;
                  })}
                </CrossPlatformHorizontalScroll>
              );
            }}
          >
            <SelectSection title="Filter by traits">
              {Object.values(traits).map((trait) => {
                return <SelectItem key={trait.id}>{trait.name}</SelectItem>;
              })}
            </SelectSection>
          </Select>
        </div>
      )}
    </div>
  );
};

export default MonthCalendarHeader;
