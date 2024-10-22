import type { CalendarDate } from '@internationalized/date';

type Range = {
  rangeStart: number;
  rangeEnd: number;
};

export const generateCalendarRange = (
  firstWeekDates: CalendarDate[],
  lastWeekDates: CalendarDate[]
): Range => {
  const [firstDay] = firstWeekDates;
  const [lastDay] = lastWeekDates.slice(-1);

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
