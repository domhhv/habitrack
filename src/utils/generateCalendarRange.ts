import type { CalendarDate } from '@internationalized/date';

export const generateCalendarRange = (
  firstWeekDates: CalendarDate[],
  lastWeekDates: CalendarDate[]
): [number, number] => {
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

  const rangeFrom = +firstDate;
  const rangeTo = +lastDate;

  return [rangeFrom, rangeTo];
};
