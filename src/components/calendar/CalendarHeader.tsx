import { useHabits, useOccurrences } from '@context';
import { useScreenSize } from '@hooks';
import { Select, SelectItem, Button } from '@nextui-org/react';
import { ArrowFatLeft, ArrowFatRight } from '@phosphor-icons/react';
import { useTraitsStore } from '@stores';
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
  const { habits } = useHabits();
  const { traits } = useTraitsStore();
  const { filteredBy, filterBy } = useOccurrences();
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
    <div className="mb-2 flex flex-col items-center justify-between gap-2 rounded-md border-3 border-neutral-500 px-4 py-4 md:flex-row md:gap-0 md:py-2">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
        <div className="mr-2 flex flex-col items-center gap-2 md:flex-row">
          <Select
            variant="bordered"
            selectedKeys={new Set([activeMonthLabel])}
            onChange={handleMonthChange}
            className="w-[250px]"
          >
            {MONTHS.map((month) => (
              <SelectItem key={month}>{month}</SelectItem>
            ))}
          </Select>
          <Select
            variant="bordered"
            selectedKeys={new Set([activeYear])}
            onChange={handleYearChange}
          >
            {YEARS.map((year) => (
              <SelectItem key={year.toString()}>{year.toString()}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            isDisabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
            role="navigate-back"
          >
            <ArrowFatLeft size="20" />
          </Button>
          <Button variant="light" onClick={onResetFocusedDate}>
            Today
          </Button>
          <Button
            isIconOnly
            variant="light"
            isDisabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
            role="navigate-forward"
          >
            <ArrowFatRight size="20" />
          </Button>
        </div>
      </div>
      {shouldRenderFilters && (
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <Select
            variant="bordered"
            label={screenSize < 1280 ? null : 'Filter by habits'}
            selectedKeys={filteredBy.habitIds}
            onChange={handleHabitsFilterChange}
            className="w-[125px] xl:w-[200px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: 'w-[200px]',
            }}
            popoverProps={{
              crossOffset: screenSize < 1280 ? -75 : 0,
            }}
          >
            {habits.map((habit) => (
              <SelectItem key={habit.id}>{habit.name}</SelectItem>
            ))}
          </Select>
          <Select
            variant="bordered"
            label={screenSize < 1280 ? null : 'Filter by traits'}
            selectedKeys={filteredBy.traitIds}
            onChange={handleTraitsFilterChange}
            className="w-[125px] xl:w-[200px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: 'w-[200px]',
            }}
            popoverProps={{
              crossOffset: screenSize < 1280 ? -75 : 0,
            }}
          >
            {traits.map((trait) => (
              <SelectItem key={trait.id}>{trait.name}</SelectItem>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;
