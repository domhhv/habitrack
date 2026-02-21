import {
  now,
  Time,
  today,
  toZoned,
  fromDate,
  CalendarDate,
  getLocalTimeZone,
  toCalendarDateTime,
  type CalendarDateTime,
} from '@internationalized/date';

import type { DaysOfWeek } from '@models';

const alignToISOWeekThursday = (value: Date) => {
  const date = new Date(value.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  return date;
};

export const getISOWeek = (value: Date) => {
  const date = alignToISOWeekThursday(value);
  const firstWeekOfYear = new Date(date.getFullYear(), 0, 4);

  return (
    1 +
    Math.round(
      ((date.getTime() - firstWeekOfYear.getTime()) / 86400000 -
        3 +
        ((firstWeekOfYear.getDay() + 6) % 7)) /
        7
    )
  );
};

export const getISOWeekYear = (value: Date) => {
  return alignToISOWeekThursday(value).getFullYear();
};

export const getCalendarDateTimeFromTimestamp = (timestamp: number) => {
  return toCalendarDateTime(fromDate(new Date(timestamp), getLocalTimeZone()));
};

export const getCurrentCalendarDateTime = () => {
  const { hour, millisecond, minute, second } = now(getLocalTimeZone());

  return toCalendarDateTime(today(getLocalTimeZone())).set({
    hour,
    millisecond,
    minute,
    second,
  });
};

export const differenceInDays = (
  from: CalendarDate | CalendarDateTime,
  to: CalendarDate | CalendarDateTime
) => {
  const tz = getLocalTimeZone();

  const dateFrom = toCalendarDateTime(from)
    .set({ hour: 0, millisecond: 0, minute: 0, second: 0 })
    .toDate(tz);

  const dateTo = toCalendarDateTime(to)
    .set({ hour: 0, millisecond: 0, minute: 0, second: 0 })
    .toDate(tz);

  const diff = dateTo.getTime() - dateFrom.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export const differenceInWeeks = (
  from: CalendarDate | CalendarDateTime,
  to: CalendarDate | CalendarDateTime
) => {
  return Math.floor(differenceInDays(from, to) / 7);
};

export const differenceInMonths = (
  from: CalendarDate | CalendarDateTime,
  to: CalendarDate | CalendarDateTime
) => {
  return (to.year - from.year) * 12 + (to.month - from.month);
};

export const differenceInHours = (
  from: CalendarDate | CalendarDateTime,
  to: CalendarDate | CalendarDateTime
) => {
  const dateFrom = from.toDate(getLocalTimeZone());
  const dateTo = to.toDate(getLocalTimeZone());

  const diff = dateTo.getTime() - dateFrom.getTime();

  return Math.floor(diff / (1000 * 60 * 60));
};

export const isThisWeek = (date: CalendarDate | CalendarDateTime) => {
  const tz = getLocalTimeZone();
  const d = date.toDate(tz);
  const nowDate = new Date();

  return (
    getISOWeek(d) === getISOWeek(nowDate) &&
    getISOWeekYear(d) === getISOWeekYear(nowDate)
  );
};

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatShortDate = (date: CalendarDate) => {
  return `${SHORT_MONTH_NAMES[date.month - 1]} ${date.day}`;
};

export const getWeeksOfYear = (
  year: number,
  firstDayOfWeek: DaysOfWeek = 'mon'
) => {
  const targetDay = firstDayOfWeek === 'mon' ? 1 : 0;

  let current = new CalendarDate(year, 1, 1);
  const currentDayOfWeek = current.toDate(getLocalTimeZone()).getDay();

  const daysToSubtract = (currentDayOfWeek - targetDay + 7) % 7;

  current = current.subtract({ days: daysToSubtract });

  const weeks = [];
  const yearEnd = new CalendarDate(year, 12, 31);

  while (current.compare(yearEnd) <= 0) {
    const weekStart = current;
    const anchorDate = weekStart.add({
      days: firstDayOfWeek === 'mon' ? 3 : 4,
    });
    const weekEnd = weekStart.add({ days: 6 });
    const weekNumber = getISOWeek(anchorDate.toDate(getLocalTimeZone()));
    const weekKey = weekStart.toString();

    weeks.push({
      anchorDate,
      endDate: weekEnd,
      key: weekKey,
      label: `W${weekNumber}: ${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)} ${anchorDate.year}`,
      startDate: weekStart,
      textValue: `W${weekNumber}: ${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)} ${anchorDate.year}`,
      weekNumber,
      year: anchorDate.year,
    });

    current = current.add({ days: 7 });
  }

  if (weeks.at(-1)?.weekNumber === 1) {
    weeks.pop();
  }

  return weeks;
};

export const isDstTransitionDay = (
  date: CalendarDate,
  timeZone: string
): 'spring' | 'fall' | null => {
  const startOfDay = toZoned(date, timeZone);
  const endOfDay = toZoned(date.add({ days: 1 }), timeZone);

  const hoursInDay =
    (endOfDay.toDate().getTime() - startOfDay.toDate().getTime()) /
    (1000 * 60 * 60);

  if (hoursInDay === 23) {
    return 'spring';
  }

  if (hoursInDay === 25) {
    return 'fall';
  }

  return null;
};

export const findDstTransitionHour = (
  date: CalendarDate,
  timeZone: string
): number | null => {
  for (let hour = 0; hour < 24; hour++) {
    const dt = toCalendarDateTime(date, new Time(hour, 0, 0));
    const before = toZoned(
      toCalendarDateTime(date, new Time(hour === 0 ? 0 : hour - 1, 0, 0)),
      timeZone
    );
    const current = toZoned(dt, timeZone);

    if (before.offset !== current.offset) {
      return hour;
    }
  }

  return null;
};
