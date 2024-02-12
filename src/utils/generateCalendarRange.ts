import type { CalendarDate } from '@internationalized/date';
import type { CalendarState } from 'react-stately';

export const generateCalendarRange = (
  state: CalendarState,
  weeksInMonth: number
): [number, number] => {
  const weeks = [...new Array(weeksInMonth).keys()];

  const firstDay = state.getDatesInWeek(0)[0] as CalendarDate;
  const lastWeekDays = state.getDatesInWeek(weeks[weeks.length - 1]);
  const lastDay = lastWeekDays[lastWeekDays.length - 1] as CalendarDate;

  const firstDate = new Date(firstDay.year, firstDay.month - 1, firstDay.day);
  const lastDate = new Date(lastDay.year, lastDay.month - 1, lastDay.day);
  const rangeFrom = +firstDate;
  const rangeTo = +lastDate;
  return [rangeFrom, rangeTo];
};
