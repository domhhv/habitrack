import {
  today,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  CalendarDate,
  startOfMonth,
  toCalendarDateTime,
} from '@internationalized/date';
import React from 'react';
import { useLocale } from 'react-aria';
import { useParams } from 'react-router';
import type { CalendarState } from 'react-stately';

import type { OccurrenceFilters } from '@models';
import {
  useHabits,
  useTraits,
  useOccurrences,
  useNoteActions,
  useOccurrenceActions,
} from '@stores';

import MonthCalendarGrid from './MonthCalendarGrid';
import MonthCalendarHeader from './MonthCalendarHeader';

type MonthCalendarProps = {
  state: CalendarState;
};

const MonthCalendar = ({ state }: MonthCalendarProps) => {
  const occurrences = useOccurrences();
  const habits = useHabits();
  const traits = useTraits();
  const params = useParams();
  const { locale } = useLocale();
  const { fetchNotes } = useNoteActions();
  const { fetchOccurrences } = useOccurrenceActions();
  const [filters, setFilters] = React.useState<OccurrenceFilters>({
    habitIds: new Set(),
    traitIds: new Set(),
  });
  const [fetchedMonthYear, setFetchedMonthYear] = React.useState<string>('');

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
    const currentMonth = startOfMonth(today(state.timeZone));

    const {
      day = currentMonth.day,
      month = currentMonth.month,
      year = currentMonth.year,
    } = params;

    const paramsDate = new CalendarDate(
      Number(year),
      Number(month),
      Number(day)
    );

    if (state.focusedDate.toString() !== paramsDate.toString()) {
      state.setFocusedDate(paramsDate);
    }

    if (fetchedMonthYear === paramsDate.toString()) {
      return;
    }

    setFetchedMonthYear(paramsDate.toString());

    const rangeStart = startOfWeek(startOfMonth(paramsDate), locale);
    const rangeEnd = toCalendarDateTime(
      endOfWeek(endOfMonth(paramsDate), locale)
    ).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    void fetchOccurrences([
      +rangeStart.toDate(state.timeZone),
      +rangeEnd.toDate(state.timeZone),
    ]);
    void fetchNotes([rangeStart, rangeEnd]);
  }, [params, state, locale, fetchNotes, fetchOccurrences, fetchedMonthYear]);

  return (
    <>
      <MonthCalendarHeader
        state={state}
        filters={filters}
        onFilterChange={setFilters}
      />
      <MonthCalendarGrid
        state={state}
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
