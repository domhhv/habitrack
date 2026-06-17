import {
  today,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  CalendarDate,
  startOfMonth,
  toCalendarDate,
  toCalendarDateTime,
} from '@internationalized/date';
import React from 'react';
import { useLocale } from 'react-aria';
import { useParams } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useFirstDayOfWeek } from '@hooks';
import { useMonthNotes, useOccurrences, useCalendarRangeChange } from '@stores';
import { buildMetricTotals, buildOccurrenceSummary } from '@utils';

import CalendarFilters from './CalendarFilters';
import CalendarNavigation from './CalendarNavigation';
import CalendarPeriodSummary from './CalendarPeriodSummary';
import MonthCalendarGrid from './MonthCalendarGrid';

type MonthCalendarProps = {
  state: CalendarState;
};

const MonthCalendar = ({ state }: MonthCalendarProps) => {
  const changeCalendarRange = useCalendarRangeChange();
  const monthNotes = useMonthNotes();
  const occurrences = useOccurrences();
  const params = useParams();
  const { locale } = useLocale();
  const firstDayOfWeek = useFirstDayOfWeek();
  const [isFocusedDateInitialized, setIsFocusedDateInitialized] =
    React.useState(false);

  const monthStart = React.useMemo(() => {
    return startOfMonth(state.focusedDate);
  }, [state.focusedDate]);

  const monthNote = React.useMemo(() => {
    return monthNotes.find((note) => {
      return note.periodDate === monthStart.toString();
    });
  }, [monthNotes, monthStart]);

  const occurrenceSummary = React.useMemo(() => {
    const monthOccurrencesById: Record<
      string,
      (typeof occurrences)[string][string]
    > = {};

    for (const dayOccurrences of Object.values(occurrences)) {
      for (const [id, occurrence] of Object.entries(dayOccurrences)) {
        if (
          occurrence.occurredAt.year === monthStart.year &&
          occurrence.occurredAt.month === monthStart.month
        ) {
          monthOccurrencesById[id] = occurrence;
        }
      }
    }

    return buildOccurrenceSummary(monthOccurrencesById);
  }, [occurrences, monthStart]);

  const metricTotals = React.useMemo(() => {
    return buildMetricTotals(occurrenceSummary);
  }, [occurrenceSummary]);

  React.useEffect(() => {
    if (!isFocusedDateInitialized && state.focusedDate.day !== 1) {
      return;
    }

    const focusedDateTime = toCalendarDateTime(state.focusedDate);

    const rangeStart = startOfWeek(
      startOfMonth(focusedDateTime),
      locale,
      firstDayOfWeek
    );
    const rangeEnd = endOfWeek(
      endOfMonth(focusedDateTime),
      locale,
      firstDayOfWeek
    ).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    changeCalendarRange([rangeStart, rangeEnd]);
  }, [
    state.focusedDate,
    firstDayOfWeek,
    changeCalendarRange,
    locale,
    isFocusedDateInitialized,
  ]);

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
      state.setFocusedDate(toCalendarDate(paramsDate));
      setIsFocusedDateInitialized(true);
    }
  }, [params, state]);

  return (
    <div className="flex w-full flex-1 gap-0 md:gap-6">
      <MonthCalendarGrid state={state} />
      <aside className="hidden w-86 shrink-0 flex-col gap-4 overflow-y-auto py-8 xl:flex">
        <CalendarNavigation focusedDate={state.focusedDate} />
        <CalendarFilters />
        <CalendarPeriodSummary
          kind="month"
          note={monthNote}
          date={monthStart}
          metricTotals={metricTotals}
          occurrenceSummary={occurrenceSummary}
        />
      </aside>
    </div>
  );
};

export default MonthCalendar;
