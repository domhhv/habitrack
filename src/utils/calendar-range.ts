import {
  today,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  CalendarDate,
  startOfMonth,
  toCalendarDateTime,
  type CalendarDateTime,
} from '@internationalized/date';

import type { DaysOfWeek } from '@models';

import type { CalendarRange } from './calendar-range-cache';

export type CalendarView = 'day' | 'week' | 'month';

type CalendarParams = { day?: string; month?: string; year?: string };

const CALENDAR_VIEWS: CalendarView[] = ['day', 'week', 'month'];

const toEndOfDay = (date: CalendarDateTime) => {
  return date.set({ hour: 23, millisecond: 999, minute: 59, second: 59 });
};

export const isCalendarView = (value: unknown): value is CalendarView => {
  return CALENDAR_VIEWS.some((view) => {
    return view === value;
  });
};

export const getFocusedCalendarDate = (
  view: CalendarView,
  { day, month, year }: CalendarParams,
  locale: string,
  firstDayOfWeek: DaysOfWeek | undefined,
  timeZone: string
) => {
  const currentDate = today(timeZone);
  const fallbackDate = {
    day: currentDate,
    month: startOfMonth(currentDate),
    week: startOfWeek(currentDate, locale, firstDayOfWeek).add({
      days: firstDayOfWeek === 'sun' ? 4 : 3,
    }),
  }[view];

  return new CalendarDate(
    Number(year ?? fallbackDate.year),
    Number(month ?? fallbackDate.month),
    Number(day ?? fallbackDate.day)
  );
};

export const getCalendarRange = (
  view: CalendarView,
  focusedDate: CalendarDate,
  locale: string,
  firstDayOfWeek: DaysOfWeek | undefined
): CalendarRange => {
  const focusedDateTime = toCalendarDateTime(focusedDate);

  if (view === 'day') {
    return [focusedDateTime, toEndOfDay(focusedDateTime)];
  }

  if (view === 'week') {
    return [
      startOfWeek(focusedDateTime, locale, firstDayOfWeek),
      toEndOfDay(endOfWeek(focusedDateTime, locale, firstDayOfWeek)),
    ];
  }

  return [
    startOfWeek(startOfMonth(focusedDateTime), locale, firstDayOfWeek),
    toEndOfDay(endOfWeek(endOfMonth(focusedDateTime), locale, firstDayOfWeek)),
  ];
};
