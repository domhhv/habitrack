import React from 'react';
import { Button, Select, SelectItem, SelectSection } from '@nextui-org/react';
import { ArrowFatLeft, ArrowFatRight } from '@phosphor-icons/react';
import { useUser } from '@supabase/auth-helpers-react';

import { useScreenSize } from '@hooks';
import { useHabitsStore, useOccurrencesStore, useTraitsStore } from '@stores';

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

  return (
    <div className="flex items-center justify-between px-2 pt-2 lg:pt-0">
      <div className="flex items-center justify-between gap-0 lg:gap-2">
        <div className="mr-0 flex items-center gap-2 lg:mr-2">
          <Select
            variant="flat"
            size={screenSize > 1024 ? 'md' : 'sm'}
            selectedKeys={new Set([activeMonthLabel])}
            onChange={handleMonthChange}
            className="w-[75px] md:w-[250px]"
            classNames={{
              popoverContent: 'w-[250px]',
            }}
          >
            {MONTHS.map((month) => (
              <SelectItem key={month}>{month}</SelectItem>
            ))}
          </Select>
          <Select
            variant="flat"
            size={screenSize > 1024 ? 'md' : 'sm'}
            selectedKeys={new Set([activeYear])}
            onChange={handleYearChange}
            classNames={{
              popoverContent: 'w-[100px]',
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
            size={screenSize > 1024 ? 'md' : 'sm'}
            variant="light"
            isDisabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
            role="navigate-back"
          >
            <ArrowFatLeft size={screenSize > 1024 ? 20 : 16} />
          </Button>
          {screenSize > 768 && (
            <Button
              size={screenSize > 1024 ? 'md' : 'sm'}
              variant="bordered"
              onClick={onResetFocusedDate}
            >
              Today
            </Button>
          )}
          <Button
            isIconOnly
            size={screenSize > 1024 ? 'md' : 'sm'}
            variant="light"
            isDisabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
            role="navigate-forward"
          >
            <ArrowFatRight size={screenSize > 1024 ? 20 : 16} />
          </Button>
        </div>
      </div>
      {shouldRenderFilters && (
        <div className="flex items-center justify-between gap-2">
          <Select
            variant="flat"
            size={screenSize > 1024 ? 'md' : 'sm'}
            selectedKeys={filteredBy.habitIds}
            onChange={handleHabitsFilterChange}
            className="w-[75px] sm:w-[125px] xl:w-[200px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: 'w-[125px]',
            }}
            popoverProps={{
              crossOffset: screenSize < 1280 ? -50 : 0,
            }}
          >
            <SelectSection title="Filter by habits">
              {habits.map((habit) => (
                <SelectItem key={habit.id}>{habit.name}</SelectItem>
              ))}
            </SelectSection>
          </Select>
          <Select
            variant="flat"
            size={screenSize > 1024 ? 'md' : 'sm'}
            selectedKeys={filteredBy.traitIds}
            onChange={handleTraitsFilterChange}
            className="w-[75px] sm:w-[125px] xl:w-[200px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: 'w-[125px]',
            }}
            popoverProps={{
              crossOffset: screenSize < 1280 ? -50 : 0,
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
