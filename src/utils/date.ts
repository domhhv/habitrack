import type { CalendarDate, CalendarDateTime } from '@internationalized/date';
import {
  now,
  today,
  fromDate,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';

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
