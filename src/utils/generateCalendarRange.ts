import type { CalendarDate } from '@internationalized/date';

type Range = {
  rangeStart: number;
  rangeEnd: number;
};

export const generateCalendarRange = (
  firstWeekDates: CalendarDate[],
  lastWeekDates: CalendarDate[]
): Range => {
  const firstDay = firstWeekDates[0] as CalendarDate;
  const lastDay = lastWeekDates[lastWeekDates.length - 1] as CalendarDate;

  const firstDate = new Date(firstDay.year, firstDay.month - 1, firstDay.day);
  const lastDate = new Date(
    lastDay.year,
    lastDay.month - 1,
    lastDay.day,
    23,
    59,
    59,
    999
  );

  const rangeStart = +firstDate;
  const rangeEnd = +lastDate;

  return { rangeStart, rangeEnd };
};
