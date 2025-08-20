import { CalendarDate } from '@internationalized/date';
import {
  endOfDay,
  endOfWeek,
  endOfMonth,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfToday,
} from 'date-fns';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { useParams } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useUser } from '@hooks';
import type { OccurrenceFilters } from '@models';
import {
  useHabits,
  useTraits,
  useOccurrences,
  useOccurrenceActions,
} from '@stores';

import MonthCalendarGrid from './MonthCalendarGrid';
import MonthCalendarHeader from './MonthCalendarHeader';

type MonthCalendarProps = {
  activeMonthLabel: string;
  activeYear: string;
  state: CalendarState;
};

const MonthCalendar = ({
  activeMonthLabel,
  activeYear,
  state,
}: MonthCalendarProps) => {
  const { user } = useUser();
  const occurrences = useOccurrences();
  const habits = useHabits();
  const traits = useTraits();
  const { clearOccurrences, fetchOccurrences } = useOccurrenceActions();
  const [filters, setFilters] = React.useState<OccurrenceFilters>({
    habitIds: new Set(),
    traitIds: new Set(),
  });
  const [fetchedMonthYear, setFetchedMonthYear] = React.useState<string>('');
  const formatter = useDateFormatter({
    month: 'long',
    timeZone: state.timeZone,
  });
  const params = useParams();
  const months = [];

  const numMonths = state.focusedDate.calendar.getMonthsInYear(
    state.focusedDate
  );

  for (let i = 1; i <= numMonths; i++) {
    const date = state.focusedDate.set({ month: i });
    months.push(formatter.format(date.toDate(state.timeZone)));
  }

  const derivedFilters = React.useMemo(() => {
    return {
      habitIds: new Set(
        Object.values(habits).map((habit) => {
          return habit.id.toString();
        })
      ),
      traitIds: new Set(
        Object.values(traits).map((trait) => {
          return trait.id.toString();
        })
      ),
    };
  }, [habits, traits]);

  React.useEffect(() => {
    if (!filters.habitIds.size || !filters.traitIds.size) {
      setFilters(derivedFilters);
    }
  }, [derivedFilters, filters.habitIds.size, filters.traitIds.size]);

  React.useEffect(() => {
    if (!user) {
      if (occurrences.length) {
        clearOccurrences();
      }

      return;
    }

    const currentMonth = startOfMonth(startOfToday());

    const {
      day = currentMonth.getDate(),
      month = currentMonth.getMonth() + 1,
      year = currentMonth.getFullYear(),
    } = params;

    const paramsDate = new Date(Number(year), Number(month) - 1, Number(day));

    const nextFocusedDate = new CalendarDate(
      paramsDate.getFullYear(),
      paramsDate.getMonth() + 1,
      paramsDate.getDate()
    );

    const hasFocusedDateChanged =
      state.focusedDate.toString() !== nextFocusedDate.toString();

    const currentMonthYear = `${Number(year)}-${Number(month)}`;
    const hasNotFetchedThisMonth = fetchedMonthYear !== currentMonthYear;

    if (hasFocusedDateChanged || hasNotFetchedThisMonth) {
      const rangeStart = startOfDay(startOfWeek(startOfMonth(paramsDate)));
      const rangeEnd = endOfDay(endOfWeek(endOfMonth(paramsDate)));

      void fetchOccurrences([+rangeStart, +rangeEnd]);
      setFetchedMonthYear(currentMonthYear);

      state.setFocusedDate(nextFocusedDate);
    }
  }, [
    fetchedMonthYear,
    params,
    state,
    user,
    fetchOccurrences,
    clearOccurrences,
    occurrences.length,
  ]);

  return (
    <>
      <MonthCalendarHeader
        months={months}
        filters={filters}
        activeYear={activeYear}
        onFilterChange={setFilters}
        activeMonthLabel={activeMonthLabel}
      />
      <MonthCalendarGrid
        state={state}
        activeYear={Number(activeYear)}
        activeMonthIndex={months.indexOf(activeMonthLabel)}
        occurrences={occurrences.filter((occurrence) => {
          return (
            filters.habitIds.has(occurrence.habitId.toString()) &&
            filters.traitIds.has(occurrence.habit?.trait?.id.toString() || '')
          );
        })}
      />
    </>
  );
};

export default MonthCalendar;
