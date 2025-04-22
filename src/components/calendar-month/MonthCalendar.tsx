import { MONTHS } from '@const';
import { useUser } from '@hooks';
import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import type { OccurrenceFilters } from '@models';
import {
  useHabits,
  useOccurrenceActions,
  useOccurrences,
  useTraits,
} from '@stores';
import { capitalize } from '@utils';
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from 'date-fns';
import React from 'react';
import { useCalendar, useLocale } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import MonthCalendarGrid from './MonthCalendarGrid';
import MonthCalendarHeader from './MonthCalendarHeader';

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
  const { fetchOccurrences, clearOccurrences } = useOccurrenceActions();
  const [filters, setFilters] = React.useState<OccurrenceFilters>({
    habitIds: new Set(),
    traitIds: new Set(),
  });
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    locale,
    createCalendar,
    isReadOnly: true,
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
      year = currentMonth.getFullYear(),
      month = currentMonth.getMonth() + 1,
      day = currentMonth.getDate(),
    } = params;

    const focusedDate = new Date(Number(year), Number(month) - 1, Number(day));

    const rangeStart = startOfWeek(startOfMonth(focusedDate));
    const rangeEnd = endOfWeek(endOfMonth(focusedDate));

    void fetchOccurrences([+rangeStart, +rangeEnd]);

    const nextFocusedDate = new CalendarDate(
      focusedDate.getFullYear(),
      focusedDate.getMonth() + 1,
      focusedDate.getDate()
    );

    const hasFocusedDateChanged =
      calendarState.focusedDate.toString() !== nextFocusedDate.toString();

    if (hasFocusedDateChanged) {
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
        activeMonthLabel={capitalize(activeMonthLabel)}
        activeYear={activeYear}
        filters={filters}
        onFilterChange={setFilters}
      />
      <MonthCalendarGrid
        activeMonthLabel={capitalize(activeMonthLabel)}
        activeYear={Number(activeYear)}
        state={calendarState}
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
