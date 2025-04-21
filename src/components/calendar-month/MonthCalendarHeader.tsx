import { TraitChip, CrossPlatformHorizontalScroll } from '@components';
import type { SelectedItems } from '@heroui/react';
import {
  Tooltip,
  ListboxItem,
  Select,
  SelectItem,
  Button,
  SelectSection,
  cn,
} from '@heroui/react';
import { useScreenWidth, useUser } from '@hooks';
import type { Habit, OccurrenceFilters, Trait } from '@models';
import {
  ArrowFatLeft,
  ArrowFatRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useTraits, useHabits } from '@stores';
import { getHabitIconUrl } from '@utils';
import { addMonths, startOfToday, startOfMonth } from 'date-fns';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { MONTHS } from './MonthCalendar';

export type MonthCalendarHeaderProps = {
  activeMonthLabel: string;
  activeYear: string;
  filters: OccurrenceFilters;
  onFilterChange: (filters: OccurrenceFilters) => void;
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const MonthCalendarHeader = ({
  activeMonthLabel,
  activeYear,
  filters,
  onFilterChange,
}: MonthCalendarHeaderProps) => {
  const habits = useHabits();
  const traits = useTraits();
  const { user } = useUser();
  const { screenWidth, isMobile } = useScreenWidth();
  const isOnCurrentMonth =
    activeMonthLabel === MONTHS[new Date().getMonth()] &&
    activeYear === new Date().getFullYear().toString();
  const { year, month, day } = useParams();
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

  const shouldRenderFilters = !!user && habits.length > 0 && traits.length > 0;

  const habitsByTraitName = React.useMemo(() => {
    const filteredHabits = Array.from(filters.habitIds)
      .map((habitId) => {
        return habits.find((habit) => {
          return habit.id === Number(habitId);
        });
      })
      .filter(Boolean) as Habit[];

    return Object.groupBy(filteredHabits, (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits, filters.habitIds]);

  const handleMonthChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    navigate(
      `/calendar/month/${focusedDate.getFullYear()}/${MONTHS.indexOf(event.target.value) + 1}/${focusedDate.getDate()}`
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
            variant="bordered"
            color="secondary"
            radius="sm"
            label="Month"
            selectedKeys={new Set([activeMonthLabel])}
            onChange={handleMonthChange}
            classNames={{
              base: 'w-[100px]',
              popoverContent: 'w-[125px]',
            }}
          >
            {MONTHS.map((month) => {
              return (
                <SelectItem key={month}>
                  {isMobile ? month.substring(0, 3) : month}
                </SelectItem>
              );
            })}
          </Select>
          <Select
            variant="bordered"
            color="secondary"
            radius="sm"
            label="Year"
            selectedKeys={new Set([activeYear])}
            onChange={handleYearChange}
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
            isIconOnly
            as={Link}
            to={`/calendar/month/${prevMonth.getFullYear()}/${prevMonth.getMonth() + 1}/${prevMonth.getDate()}`}
            size="md"
            radius="sm"
            variant="light"
            color="secondary"
            className="h-auto"
            role="navigate-back"
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
              className={cn('h-auto', isMobile && 'min-w-fit p-0')}
              to={`/calendar/month/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`}
              startContent={<ArrowsClockwise size={20} />}
            >
              {(!isMobile || screenWidth < 373) && 'Today'}
            </Button>
          )}
          <Button
            as={Link}
            isIconOnly
            size="md"
            variant="light"
            color="secondary"
            radius="sm"
            to={`/calendar/month/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/${nextMonth.getDate()}`}
            className="h-auto"
            role="navigate-forward"
          >
            <ArrowFatRight size={20} />
          </Button>
        </div>
      </div>
      {shouldRenderFilters && (
        <div className="flex flex-col items-stretch justify-end gap-2 min-[450px]:flex-row lg:justify-between">
          <Select
            variant="bordered"
            color="secondary"
            radius="sm"
            label="Filter by habits"
            selectedKeys={filters.habitIds}
            onChange={handleHabitsFilterChange}
            className="w-full md:w-[200px]"
            selectionMode="multiple"
            popoverProps={{
              crossOffset: isMobile ? -75 : 0,
            }}
            renderValue={(selectedHabits: SelectedItems<Habit>) => {
              return (
                <CrossPlatformHorizontalScroll className="flex space-x-2">
                  {selectedHabits.map(({ key }) => {
                    const habit = habits.find((h) => {
                      return h.id === Number(key);
                    });

                    if (!habit) {
                      return null;
                    }

                    const { id, name, iconPath } = habit;
                    const iconUrl = getHabitIconUrl(iconPath);

                    return (
                      <Tooltip key={id} content={name}>
                        <img
                          src={iconUrl}
                          alt={`${name} icon`}
                          className="h-4 w-4"
                        />
                      </Tooltip>
                    );
                  })}
                </CrossPlatformHorizontalScroll>
              );
            }}
          >
            {Object.keys(habitsByTraitName).map((traitName) => {
              return (
                <SelectSection key={traitName} title={traitName} showDivider>
                  {habitsByTraitName[traitName] ? (
                    habitsByTraitName[traitName].map((habit) => {
                      const iconUrl = getHabitIconUrl(habit.iconPath);

                      return (
                        <SelectItem key={habit.id} textValue={habit.name}>
                          <div className="flex items-center gap-2">
                            <img
                              src={iconUrl}
                              alt={habit.name}
                              role="habit-icon"
                              className="h-4 w-4"
                            />
                            <span>{habit.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <ListboxItem key="none">No habits</ListboxItem>
                  )}
                </SelectSection>
              );
            })}
          </Select>
          <Select
            variant="bordered"
            color="secondary"
            radius="sm"
            label="Filter by traits"
            size="md"
            selectedKeys={filters.traitIds}
            onChange={handleTraitsFilterChange}
            className="w-full md:w-[250px]"
            selectionMode="multiple"
            renderValue={(selectedTraits: SelectedItems<Trait>) => {
              return (
                <CrossPlatformHorizontalScroll className="space-x-2">
                  {selectedTraits.map(({ key }) => {
                    const trait = traits.find((t) => {
                      return t.id === Number(key);
                    });

                    if (!trait) {
                      return null;
                    }

                    const { id, name, color } = trait;

                    return <TraitChip key={id} trait={{ name, color }} />;
                  })}
                </CrossPlatformHorizontalScroll>
              );
            }}
          >
            <SelectSection title="Filter by traits">
              {traits.map((trait) => {
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
