import { useHabits, useOccurrences, useTraits } from '@context';
import { useScreenSize } from '@hooks';
import { Select, SelectItem, Button } from '@nextui-org/react';
import {
  ArrowFatLeft,
  ArrowFatRight,
  ArrowsClockwise,
  Scribble,
} from '@phosphor-icons/react';
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

const YEARS = [
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
];

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
  const { allTraits } = useTraits();
  const { filteredBy, filterBy } = useOccurrences();
  const user = useUser();
  const screenSize = useScreenSize();

  const shouldRenderFilters =
    !!user && habits.length > 0 && allTraits.length > 0;

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
      habitIds: [...filteredBy.habitIds, +event.target.value],
    });
  };

  const handleTraitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    filterBy({
      ...filteredBy,
      traitIds: [...filteredBy.traitIds, +event.target.value],
    });
  };

  return (
    <div className="mb-2 flex flex-col items-center justify-between gap-2 rounded-md border-3 border-neutral-500 px-4 py-2 md:flex-row md:gap-0">
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
            disabled={prevButtonProps.disabled}
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
            disabled={nextButtonProps.disabled}
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
            renderValue={() => {
              if (screenSize < 1280) {
                return <ArrowsClockwise />;
              }

              return 'Filter by habits';
            }}
            selectedKeys={
              new Set(filteredBy.habitIds.map((id) => id.toString()))
            }
            onChange={handleHabitsFilterChange}
            className="w-[75px] xl:w-[200px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: 'w-[200px]',
            }}
            popoverProps={{
              placement: screenSize < 1280 ? 'bottom-end' : 'bottom-start',
            }}
          >
            {habits.map((habit) => (
              <SelectItem key={habit.id}>{habit.name}</SelectItem>
            ))}
          </Select>
          <Select
            variant="bordered"
            renderValue={() => {
              if (screenSize < 1280) {
                return <Scribble />;
              }

              return 'Filter by habits';
            }}
            selectedKeys={
              new Set(filteredBy.traitIds.map((id) => id.toString()))
            }
            onChange={handleTraitsFilterChange}
            className="w-[75px] xl:w-[200px]"
            selectionMode="multiple"
            classNames={{
              popoverContent: 'w-[200px]',
            }}
            popoverProps={{
              placement: screenSize < 1280 ? 'bottom-end' : 'bottom-start',
            }}
          >
            {allTraits.map((trait) => (
              <SelectItem key={trait.id}>{trait.label}</SelectItem>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;
