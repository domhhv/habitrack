import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import {
  endOfWeek,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  startOfToday,
} from 'date-fns';
import React from 'react';
import { useLocale, useCalendar } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import { MonthCalendarGrid, MonthCalendarHeader } from '@components';
import { MONTHS } from '@const';
import { useUser } from '@hooks';
import type { OccurrenceFilters } from '@models';
import {
  useHabits,
  useTraits,
  useOccurrences,
  useOccurrenceActions,
} from '@stores';
import { capitalize } from '@utils';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();

    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const MonthCalendar = () => {
  const { user } = useUser();
  const occurrences = useOccurrences();
  const habits = useHabits();
  const traits = useTraits();
  const { clearOccurrences, fetchOccurrences } = useOccurrenceActions();
  const [filters, setFilters] = React.useState<OccurrenceFilters>({
    habitIds: new Set(),
    traitIds: new Set(),
  });
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    createCalendar,
    isReadOnly: true,
    locale,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);
  const params = useParams();

  React.useEffect(() => {
    setFilters({
      habitIds: new Set(
        habits.map((habit) => {
          return habit.id.toString();
        })
      ),
      traitIds: new Set(
        traits.map((trait) => {
          return trait.id.toString();
        })
      ),
    });
  }, [habits, traits]);

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
    occurrences.length,
  ]);

  const [, activeYear] = title.split(' ');

  const activeMonthLabel = MONTHS[calendarState.focusedDate.month - 1];

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 md:gap-4 md:py-4 lg:px-16"
    >
      <title>
        {`${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`}
      </title>
      <MonthCalendarHeader
        filters={filters}
        activeYear={activeYear}
        onFilterChange={setFilters}
        activeMonthLabel={capitalize(activeMonthLabel)}
      />
      <MonthCalendarGrid
        state={calendarState}
        activeYear={Number(activeYear)}
        activeMonthLabel={capitalize(activeMonthLabel)}
        occurrences={occurrences.filter((occurrence) => {
          return (
            filters.habitIds.has(occurrence.habitId.toString()) &&
            filters.traitIds.has(occurrence.habit?.trait?.id.toString() || '')
          );
        })}
      />
    </div>
  );
};

export default MonthCalendar;
