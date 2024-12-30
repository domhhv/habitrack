import { useScreenSize } from '@hooks';
import { Select, SelectItem, Button, SelectSection } from '@nextui-org/react';
import { ArrowFatLeft, ArrowFatRight } from '@phosphor-icons/react';
import { useTraitsStore, useHabitsStore, useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

type NavigationButtonProps = {
  disabled: boolean;
  'aria-label': string;
};

export type CalendarHeaderProps = {
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

const CalendarHeader = ({
  activeMonthLabel,
  activeYear,
  prevButtonProps,
  nextButtonProps,
  onNavigateBack,
  onNavigateForward,
  onNavigateToMonth,
  onNavigateToYear,
  onResetFocusedDate,
}: CalendarHeaderProps) => {
  const { habits } = useHabitsStore();
  const { traits } = useTraitsStore();
  const { filteredBy, filterBy } = useOccurrencesStore();
  const user = useUser();
  const screenSize = useScreenSize();
  const isOnCurrentMonth = activeMonthLabel === MONTHS[new Date().getMonth()];

  const shouldRenderFilters = !!user && habits.length > 0 && traits.length > 0;

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
    <div className="flex items-center justify-between px-0 pt-2 lg:px-0 lg:pt-0">
      <div className="flex items-center justify-between gap-0 lg:gap-2">
        <div className="mr-0 flex items-center gap-2 lg:mr-2">
          <Select
            variant="bordered"
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
        <div className="flex items-center gap-0 lg:gap-2">
          <Button
            isIconOnly
            size={isDesktop ? 'md' : 'sm'}
            variant="light"
            isDisabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
            className={isMobile ? 'w-6 min-w-fit p-0' : ''}
            role="navigate-back"
          >
            <ArrowFatLeft size={isDesktop ? 20 : 16} />
          </Button>
          {!isMobile && !isOnCurrentMonth && (
            <Button
              size={isDesktop ? 'md' : 'sm'}
              variant="bordered"
              onClick={onResetFocusedDate}
            >
              Today
            </Button>
          )}
          <Button
            isIconOnly
            size={isDesktop ? 'md' : 'sm'}
            variant="light"
            isDisabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
            className={isMobile ? 'w-6 min-w-fit p-0' : ''}
            role="navigate-forward"
          >
            <ArrowFatRight size={isDesktop ? 20 : 16} />
          </Button>
        </div>
      </div>
      {shouldRenderFilters && (
        <div className="flex items-center justify-between gap-2">
          <Select
            variant="bordered"
            size={isDesktop ? 'md' : 'sm'}
            selectedKeys={filteredBy.habitIds}
            onChange={handleHabitsFilterChange}
            className="w-[75px] md:w-[250px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: isMobile ? 'w-[150px]' : 'w-[250px]',
              selectorIcon: isMobile && 'hidden',
              innerWrapper: isMobile && 'w-full',
              value: isMobile && 'text-tiny',
            }}
            popoverProps={{
              crossOffset: isMobile ? -75 : 0,
            }}
          >
            <SelectSection title="Filter by habits">
              {habits.map((habit) => (
                <SelectItem key={habit.id}>{habit.name}</SelectItem>
              ))}
            </SelectSection>
          </Select>
          <Select
            variant="bordered"
            size={isDesktop ? 'md' : 'sm'}
            selectedKeys={filteredBy.traitIds}
            onChange={handleTraitsFilterChange}
            className="w-[75px] md:w-[250px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: isMobile ? 'w-[150px]' : 'w-[250px]',
              selectorIcon: isMobile && 'hidden',
              innerWrapper: isMobile && 'w-full',
              value: isMobile && 'text-tiny',
            }}
            popoverProps={{
              crossOffset: screenSize < 768 ? -75 : 0,
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

export default CalendarHeader;
