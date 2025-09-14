import { useDisclosure, type SelectedItems } from '@heroui/react';
import {
  cn,
  Button,
  Select,
  Tooltip,
  Checkbox,
  SelectItem,
  SelectSection,
} from '@heroui/react';
import { today, isSameMonth } from '@internationalized/date';
import {
  ArrowFatLeft,
  ArrowFatRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { Link } from 'react-router';
import type { CalendarState } from 'react-stately';

import { TraitChip, CrossPlatformHorizontalScroll } from '@components';
import { useUser, useScreenWidth } from '@hooks';
import type { Habit, Trait, OccurrenceFilters } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useHabits, useTraits } from '@stores';

export type MonthCalendarHeaderProps = {
  filters: OccurrenceFilters;
  state: CalendarState;
  onFilterChange: (filters: OccurrenceFilters) => void;
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const MonthCalendarHeader = ({
  filters,
  onFilterChange,
  state,
}: MonthCalendarHeaderProps) => {
  const habits = useHabits();
  const traits = useTraits();
  const { user } = useUser();
  const { isMobile, screenWidth } = useScreenWidth();
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
  const {
    isOpen: isMonthSelectOpen,
    onClose: closeMonthSelect,
    onOpenChange: onMonthSelectOpenChange,
  } = useDisclosure();
  const {
    isOpen: isYearSelectOpen,
    onClose: closeYearSelect,
    onOpenChange: onYearSelectOpenChange,
  } = useDisclosure();

  const shouldRenderFilters =
    !!user && Object.keys(habits).length > 0 && Object.keys(traits).length > 0;

  const areAllHabitsSelected = React.useMemo(() => {
    if (filters.habitIds.size === 1 && filters.habitIds.has('')) {
      return false;
    }

    return filters.habitIds.size === Object.keys(habits).length;
  }, [filters.habitIds, habits]);

  const areAllTraitsSelected = React.useMemo(() => {
    if (filters.traitIds.size === 1 && filters.traitIds.has('')) {
      return false;
    }

    return filters.traitIds.size === Object.keys(traits).length;
  }, [filters.traitIds, traits]);

  const habitsByTraitName = React.useMemo(() => {
    return groupBy(Object.values(habits), (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

  const handleHabitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    if (event.target.value.includes('toggle-all')) {
      if (areAllHabitsSelected) {
        onFilterChange({
          ...filters,
          habitIds: new Set(['']),
        });

        return;
      }

      const allHabitIds = Object.keys(habits).filter((id) => {
        return id !== '';
      });

      onFilterChange({
        ...filters,
        habitIds: new Set(allHabitIds),
      });

      return;
    }

    onFilterChange({
      ...filters,
      habitIds: new Set(event.target.value.split(',')),
    });
  };

  const handleTraitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    if (event.target.value.includes('toggle-all')) {
      if (areAllTraitsSelected) {
        onFilterChange({
          ...filters,
          traitIds: new Set(['']),
        });

        return;
      }

      const allTraitIds = Object.keys(traits).filter((id) => {
        return id !== '';
      });

      onFilterChange({
        ...filters,
        traitIds: new Set(allTraitIds),
      });

      return;
    }

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
            isOpen={isMonthSelectOpen}
            onOpenChange={onMonthSelectOpenChange}
            selectedKeys={String(state.focusedDate.month)}
            classNames={{
              base: 'w-[100px]',
              popoverContent: 'w-[125px]',
            }}
          >
            {months.map((month, index) => {
              return (
                <SelectItem
                  as={Link}
                  key={String(index + 1)}
                  onClick={closeMonthSelect}
                  href={`/calendar/month/${state.focusedDate.year}/${index + 1}/1`}
                >
                  {capitalize(isMobile ? month.substring(0, 3) : month)}
                </SelectItem>
              );
            })}
          </Select>
          <Select
            radius="sm"
            label="Year"
            color="secondary"
            variant="bordered"
            isOpen={isYearSelectOpen}
            onOpenChange={onYearSelectOpenChange}
            selectedKeys={[state.focusedDate.year.toString()]}
            classNames={{
              base: 'w-[100px]',
            }}
          >
            {YEARS.map((year) => {
              return (
                <SelectItem
                  as={Link}
                  key={year.toString()}
                  onClick={closeYearSelect}
                  href={`/calendar/month/${year}/${state.focusedDate.month}/1`}
                >
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
            to={`/calendar/month/${prevMonth.year}/${prevMonth.month}/${prevMonth.day}`}
          >
            <ArrowFatLeft size={20} />
          </Button>
          {!isSameMonth(state.focusedDate, today(state.timeZone)) && (
            <Button
              as={Link}
              size="md"
              radius="sm"
              variant="light"
              color="secondary"
              startContent={<ArrowsClockwise size={20} />}
              className={cn('h-auto', isMobile && 'min-w-fit p-0')}
              to={`/calendar/month/${today(state.timeZone).year}/${today(state.timeZone).month}/${today(state.timeZone).day}`}
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
            to={`/calendar/month/${nextMonth.year}/${nextMonth.month}/${nextMonth.day}`}
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
            <>
              {!!Object.keys(habits).length && (
                <SelectItem
                  key="toggle-all"
                  className="mb-0.5"
                  textValue="Toggle all"
                >
                  <Checkbox
                    color="secondary"
                    isSelected={areAllHabitsSelected}
                    isIndeterminate={
                      !areAllHabitsSelected && filters.habitIds.size > 1
                    }
                  />
                  <span>
                    {areAllHabitsSelected ? 'Unselect' : 'Select'} all
                  </span>
                </SelectItem>
              )}
              {Object.entries(habitsByTraitName).map(([traitName, habits]) => {
                if (!habits?.length) {
                  return null;
                }

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
                    {habits.map((habit) => {
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
            </>
          </Select>
          <Select
            size="md"
            radius="sm"
            color="secondary"
            variant="bordered"
            label="Filter by traits"
            selectionMode="multiple"
            selectedKeys={filters.traitIds}
            onChange={handleTraitsFilterChange}
            className="w-full min-[450px]:w-1/2 md:w-[250px]"
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
            <>
              {!!Object.keys(traits).length && (
                <SelectItem
                  key="toggle-all"
                  className="mb-0.5"
                  textValue="Toggle all"
                >
                  <Checkbox
                    color="secondary"
                    isSelected={areAllTraitsSelected}
                    isIndeterminate={
                      !areAllTraitsSelected && filters.traitIds.size > 1
                    }
                  />
                  <span>
                    {areAllTraitsSelected ? 'Unselect' : 'Select'} all
                  </span>
                </SelectItem>
              )}
              <SelectSection title="Filter by traits">
                {Object.values(traits).map((trait) => {
                  return <SelectItem key={trait.id}>{trait.name}</SelectItem>;
                })}
              </SelectSection>
            </>
          </Select>
        </div>
      )}
    </div>
  );
};

export default MonthCalendarHeader;
