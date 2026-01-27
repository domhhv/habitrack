import { AnimatePresence } from 'framer-motion';
import React from 'react';
import type { CalendarState } from 'react-stately';

import { useScreenWidth } from '@hooks';
import type { OccurrenceFilters } from '@models';
import { useUser, useHabits, useTraits } from '@stores';

import MonthCalendarFilters from './MonthCalendarFilters';
import MonthCalendarNavigation from './MonthCalendarNavigation';

export type MonthCalendarHeaderProps = {
  filters: OccurrenceFilters;
  state: CalendarState;
  onFilterChange: (filters: OccurrenceFilters) => void;
};

const MonthCalendarHeader = ({
  filters,
  onFilterChange,
  state,
}: MonthCalendarHeaderProps) => {
  const habits = useHabits();
  const traits = useTraits();
  const { user } = useUser();
  const { isDesktop } = useScreenWidth();
  const [isFilteringShownOnMobile, setIsFilteringShownOnMobile] =
    React.useState(false);

  const shouldRenderFilters = React.useMemo(() => {
    if (!isDesktop && !isFilteringShownOnMobile) {
      return false;
    }

    if (Object.keys(habits).length <= 1 && Object.keys(traits).length <= 1) {
      return false;
    }

    return Boolean(user);
  }, [habits, isFilteringShownOnMobile, isDesktop, traits, user]);

  const isFilterToggleVisible = React.useMemo(() => {
    if (Object.keys(habits).length <= 1 && Object.keys(traits).length <= 1) {
      return false;
    }

    return Boolean(user);
  }, [habits, traits, user]);

  return (
    <div className="flex flex-col items-stretch justify-between gap-2 px-0 pt-2 md:pt-0 lg:flex-row lg:gap-0 lg:px-0">
      <MonthCalendarNavigation
        state={state}
        isFilterToggleVisible={isFilterToggleVisible}
        onToggleFilters={() => {
          setIsFilteringShownOnMobile((prev) => {
            return !prev;
          });
        }}
      />
      <AnimatePresence mode="wait">
        {shouldRenderFilters && (
          <MonthCalendarFilters
            filters={filters}
            onFilterChange={onFilterChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthCalendarHeader;
