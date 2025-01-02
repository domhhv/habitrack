import { TraitChip } from '@components';
import { useScreenSize } from '@hooks';
import type { Habit, Trait } from '@models';
import type { SelectedItems } from '@nextui-org/react';
import {
  ListboxItem,
  Select,
  SelectItem,
  Button,
  SelectSection,
} from '@nextui-org/react';
import { ArrowFatLeft, ArrowFatRight } from '@phosphor-icons/react';
import { useTraitsStore, useHabitsStore, useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
import clsx from 'clsx';
import React from 'react';

type NavigationButtonProps = {
  disabled: boolean;
  'aria-label': string;
};

export type MonthCalendarHeaderProps = {
  activeMonthLabel: string;
  activeYear: string;
  prevButtonProps: NavigationButtonProps;
  nextButtonProps: NavigationButtonProps;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onNavigateToMonth: (month: number) => void;
  onNavigateToYear: (year: number) => void;
  onResetFocusedDate: () => void;
};

const MONTHS = [
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

const YEARS = Array.from({ length: 31 }, (_, i) => 2000 + i);

const MonthCalendarHeader = ({
  activeMonthLabel,
  activeYear,
  prevButtonProps,
  nextButtonProps,
  onNavigateBack,
  onNavigateForward,
  onNavigateToMonth,
  onNavigateToYear,
  onResetFocusedDate,
}: MonthCalendarHeaderProps) => {
  const { habits } = useHabitsStore();
  const { traits } = useTraitsStore();
  const { filteredBy, filterBy } = useOccurrencesStore();
  const user = useUser();
  const screenSize = useScreenSize();
  const isOnCurrentMonth = activeMonthLabel === MONTHS[new Date().getMonth()];

  const shouldRenderFilters = !!user && habits.length > 0 && traits.length > 0;

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(habits, (habit) => habit.trait?.name || 'Unknown');
  }, [habits]);

  const handleMonthChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    onNavigateToMonth(MONTHS.indexOf(event.target.value) + 1);
  };

  const handleYearChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    onNavigateToYear(+event.target.value);
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

  const isMobile = screenSize < 768;
  const isDesktop = screenSize > 1024;

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
            {MONTHS.map((month) => (
              <SelectItem key={month}>{month}</SelectItem>
            ))}
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
            {YEARS.map((year) => (
              <SelectItem key={year.toString()}>{year.toString()}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex items-stretch gap-0 lg:gap-2">
          <Button
            isIconOnly
            size={isDesktop ? 'md' : 'sm'}
            radius="sm"
            variant="light"
            color="secondary"
            isDisabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
            className={clsx(
              'h-auto dark:text-secondary-600',
              isMobile && 'w-6 min-w-fit p-0'
            )}
            role="navigate-back"
          >
            <ArrowFatLeft size={isDesktop ? 20 : 16} />
          </Button>
          {!isMobile && !isOnCurrentMonth && (
            <Button
              size={isDesktop ? 'md' : 'sm'}
              radius="sm"
              variant="bordered"
              color="secondary"
              onClick={onResetFocusedDate}
              className="h-auto"
            >
              Today
            </Button>
          )}
          <Button
            isIconOnly
            size={isDesktop ? 'md' : 'sm'}
            variant="light"
            color="secondary"
            radius="sm"
            isDisabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
            className={clsx('h-auto', isMobile && 'w-6 min-w-fit p-0')}
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
              innerWrapper: clsx(
                'w-full overflow-x-scroll !pt-6 md:w-48',
                isMobile && '!pt-0'
              ),
              value: 'text-tiny md:text-base !overflow-visible flex gap-2 w-48',
              trigger: clsx(!isMobile && 'h-18 pt-0'),
              label: '!-translate-y-2',
            }}
            popoverProps={{
              crossOffset: isMobile ? -75 : 0,
            }}
            renderValue={(selectedHabits: SelectedItems<Habit>) => {
              return selectedHabits.map(({ key }) => {
                const habit = habits.find((h) => h.id === Number(key));

                if (!habit) {
                  return null;
                }

                const { id, name, iconPath } = habit;
                const iconUrl = getHabitIconUrl(iconPath);

                return (
                  <img
                    key={id}
                    src={iconUrl}
                    alt={`${name} icon`}
                    className={clsx('h-4 w-4', screenSize < 400 && 'h-3 w-3')}
                  />
                );
              });
            }}
          >
            {Object.keys(habitsByTraitName).map((traitName) => (
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
            ))}
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
              innerWrapper: clsx(
                'w-full overflow-x-scroll !pt-6 md:w-48',
                isMobile && '!pt-0'
              ),
              value: 'text-tiny md:text-base !overflow-visible flex gap-2 w-48',
              trigger: clsx(!isMobile && 'h-18 pt-0'),
              label: '!-translate-y-2',
            }}
            popoverProps={{
              crossOffset: screenSize < 768 ? -75 : 0,
            }}
            renderValue={(selectedTraits: SelectedItems<Trait>) => {
              return selectedTraits.map(({ key }) => {
                const trait = traits.find((t) => t.id === Number(key));

                if (!trait) {
                  return null;
                }

                const { id, name, color } = trait;

                return <TraitChip key={id} trait={{ name, color }} />;
              });
            }}
          >
            <SelectSection title="Filter by traits">
              {traits.map((trait) => (
                <SelectItem key={trait.id}>{trait.name}</SelectItem>
              ))}
            </SelectSection>
          </Select>
        </div>
      )}
    </div>
  );
};

export default MonthCalendarHeader;
