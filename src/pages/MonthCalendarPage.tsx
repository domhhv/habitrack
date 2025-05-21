import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import {
  endOfWeek,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  startOfToday,
} from 'date-fns';
import React from 'react';
import { useCalendar, useDateFormatter } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import { MonthCalendarGrid, MonthCalendarHeader } from '@components';
import { useUser } from '@hooks';
import type { OccurrenceFilters } from '@models';
import {
  useHabits,
  useTraits,
  useOccurrences,
  useOccurrenceActions,
} from '@stores';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();

    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

type MonthCalendarProps = {
  locale: string;
};

const MonthCalendar = ({ locale }: MonthCalendarProps) => {
  const { user } = useUser();
  const occurrences = useOccurrences();
  const habits = useHabits();
  const traits = useTraits();
  const { clearOccurrences, fetchOccurrences } = useOccurrenceActions();
  const [filters, setFilters] = React.useState<OccurrenceFilters>({
    habitIds: new Set(),
    traitIds: new Set(),
  });
  const calendarState = useCalendarState({
    createCalendar,
    firstDayOfWeek: 'mon',
    isReadOnly: true,
    locale,
  });
  const formatter = useDateFormatter({
    month: 'long',
    timeZone: calendarState.timeZone,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);
  const params = useParams();
  const months = [];

  const numMonths = calendarState.focusedDate.calendar.getMonthsInYear(
    calendarState.focusedDate
  );

  for (let i = 1; i <= numMonths; i++) {
    const date = calendarState.focusedDate.set({ month: i });
    months.push(formatter.format(date.toDate(calendarState.timeZone)));
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
      if (Object.keys(occurrences).length) {
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
      calendarState.focusedDate.toString() !== nextFocusedDate.toString();

    if (hasFocusedDateChanged) {
      const rangeStart = startOfWeek(startOfMonth(paramsDate));
      const rangeEnd = endOfWeek(endOfMonth(paramsDate));

      void fetchOccurrences([+rangeStart, +rangeEnd]);

      calendarState.setFocusedDate(nextFocusedDate);
    }
  }, [
    params,
    calendarState,
    user,
    fetchOccurrences,
    clearOccurrences,
    occurrences,
  ]);

  const [activeMonthLabel, activeYear] = title.split(' ');

  const filteredOccurrences = React.useMemo(() => {
    return Object.values(occurrences).filter((occurrence) => {
      return (
        filters.habitIds.has(occurrence.habitId.toString()) &&
        filters.traitIds.has(occurrence.habit?.trait?.id.toString() || '')
      );
    });
  }, [occurrences, filters.habitIds, filters.traitIds]);

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 md:gap-4 md:py-4 lg:px-16"
    >
      <title>
        {`${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`}
      </title>
      <MonthCalendarHeader
        months={months}
        filters={filters}
        activeYear={activeYear}
        onFilterChange={setFilters}
        activeMonthLabel={activeMonthLabel}
      />
      <MonthCalendarGrid
        state={calendarState}
        activeYear={Number(activeYear)}
        occurrences={filteredOccurrences}
        activeMonthIndex={months.indexOf(activeMonthLabel)}
      />
    </div>
  );
};

export default MonthCalendar;
