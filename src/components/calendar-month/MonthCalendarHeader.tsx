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
import type { Habit, Trait } from '@models';
import {
  ArrowFatLeft,
  ArrowFatRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useTraitsStore, useHabitsStore, useOccurrencesStore } from '@stores';
import { getHabitIconUrl } from '@utils';
import { addMonths, startOfToday, startOfMonth } from 'date-fns';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { MONTHS } from './MonthCalendar';

export type MonthCalendarHeaderProps = {
  activeMonthLabel: string;
  activeYear: string;
};

const YEARS = Array.from({ length: 31 }, (_, i) => {
  return 2000 + i;
});

const MonthCalendarHeader = ({
  activeMonthLabel,
  activeYear,
}: MonthCalendarHeaderProps) => {
  const { habits } = useHabitsStore();
  const { traits } = useTraitsStore();
  const { filteredBy, filterBy } = useOccurrencesStore();
  const { user } = useUser();
  const { screenWidth, isDesktop, isMobile, isTablet } = useScreenWidth();
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
    return Object.groupBy(habits, (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

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
    filterBy({
      ...filteredBy,
      habitIds: new Set(event.target.value.split(',')),
    });
  };

  const handleTraitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    filterBy({
      ...filteredBy,
      traitIds: new Set(event.target.value.split(',')),
    });
  };

  return (
    <div className="flex items-stretch justify-between px-0 pt-2 lg:px-0 lg:pt-0">
      <div className="flex items-stretch justify-between gap-0 lg:gap-2">
        <div className="mr-0 flex items-stretch gap-2 lg:mr-2">
          <Select
            variant="bordered"
            color="secondary"
            radius="sm"
            label={isMobile ? null : 'Month'}
            size={isDesktop ? 'md' : 'sm'}
            selectedKeys={new Set([activeMonthLabel])}
            onChange={handleMonthChange}
            classNames={{
              base: 'w-[75px] md:w-[125px]',
              popoverContent: 'w-[125px]',
              selectorIcon: isMobile && 'hidden',
              innerWrapper: isMobile && 'w-full',
              value: isMobile && 'text-tiny',
            }}
          >
            {MONTHS.map((month) => {
              return <SelectItem key={month}>{month}</SelectItem>;
            })}
          </Select>
          <Select
            variant="bordered"
            color="secondary"
            radius="sm"
            label={isMobile ? null : 'Year'}
            size={isDesktop ? 'md' : 'sm'}
            selectedKeys={new Set([activeYear])}
            onChange={handleYearChange}
            classNames={{
              base: 'w-[50px] md:w-[100px]',
              popoverContent: isMobile ? 'w-[75px]' : 'w-[100px]',
              selectorIcon: isMobile && 'hidden',
              innerWrapper: isMobile && 'w-full',
              value: isMobile && 'text-tiny',
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
            size={isDesktop ? 'md' : 'sm'}
            radius="sm"
            variant="light"
            color="secondary"
            className={cn('h-auto', isMobile && 'w-6 min-w-fit p-0')}
            role="navigate-back"
          >
            <ArrowFatLeft size={isDesktop ? 20 : 16} />
          </Button>
          {!isMobile && !isOnCurrentMonth && (
            <Button
              as={Link}
              size={isDesktop ? 'md' : 'sm'}
              radius="sm"
              variant="light"
              color="secondary"
              className="h-auto"
              to={`/calendar/month/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`}
              startContent={<ArrowsClockwise size={isDesktop ? 16 : 12} />}
            >
              Today
            </Button>
          )}
          <Button
            as={Link}
            isIconOnly
            size={isDesktop ? 'md' : 'sm'}
            variant="light"
            color="secondary"
            radius="sm"
            to={`/calendar/month/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/${nextMonth.getDate()}`}
            className={cn('h-auto', isMobile && 'w-6 min-w-fit p-0')}
            role="navigate-forward"
          >
            <ArrowFatRight size={isDesktop ? 20 : 16} />
          </Button>
        </div>
      </div>
      {shouldRenderFilters && (
        <div className="flex items-stretch justify-between gap-2">
          <Select
            variant="bordered"
            color="secondary"
            radius="sm"
            label={isMobile ? null : 'Filter by habits'}
            size={isDesktop ? 'md' : 'sm'}
            selectedKeys={filteredBy.habitIds}
            onChange={handleHabitsFilterChange}
            className="w-[75px] md:w-[250px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: isMobile ? 'w-[150px]' : 'w-[250px]',
              selectorIcon: isMobile && 'hidden',
              innerWrapper: cn(
                'w-full overflow-x-scroll !pt-6 md:w-48 scrollbar-hide',
                isMobile && '!pt-0'
              ),
              value: 'text-tiny md:text-base !overflow-visible flex gap-2 w-48 !leading-none',
              trigger: cn(!isMobile && 'h-18 pt-0'),
              label: '!-translate-y-2',
            }}
            popoverProps={{
              crossOffset: isMobile ? -75 : 0,
            }}
            renderValue={(selectedHabits: SelectedItems<Habit>) => {
              return (
                <CrossPlatformHorizontalScroll className='space-x-2'>
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
                          className={cn('h-5 w-5', screenWidth < 400 && 'h-3 w-3')}
                        />
                      </Tooltip>
                    );
                  })}
                </CrossPlatformHorizontalScroll>
              )
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
            size={isDesktop ? 'md' : 'sm'}
            selectedKeys={filteredBy.traitIds}
            label={isMobile ? null : 'Filter by traits'}
            onChange={handleTraitsFilterChange}
            className="w-[75px] md:w-[250px]"
            selectionMode="multiple"

            classNames={{
              popoverContent: isMobile ? 'w-[150px]' : 'w-[250px]',
              selectorIcon: isMobile && 'hidden',
              innerWrapper: cn(
                'w-full !pt-6 md:w-48',
                isMobile && '!pt-0'
              ),
              value: cn('text-tiny md:text-base !overflow-visible flex gap-2 w-48 !leading-none h-5 items-start', !isDesktop && 'w-full'),
              trigger: cn(!isMobile && 'h-18 pt-0'),
              label: '!-translate-y-2',
            }}
            popoverProps={{
              crossOffset: isMobile ? -75 : 0,
            }}
            renderValue={(selectedTraits: SelectedItems<Trait>) => {
              return (
                <CrossPlatformHorizontalScroll className='space-x-2'>
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
              )
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
