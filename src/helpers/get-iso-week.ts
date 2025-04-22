import { getMonthIndex } from '@utils';

const getMondayOffset = (day: number): number => {
  return (day + 6) % 7;
};

const getFirstMondayOfMonth = (year: number, monthIndex: number): Date => {
  const firstDay = new Date(year, monthIndex, 1);
  const offset = getMondayOffset(firstDay.getDay());
  firstDay.setDate(firstDay.getDate() - offset);

  return firstDay;
};

const getDateForMonthWeek = (
  year: number,
  monthIndex: number,
  weekIndex: number
): Date => {
  const mondayOfMonth = getFirstMondayOfMonth(year, monthIndex);
  mondayOfMonth.setDate(mondayOfMonth.getDate() + weekIndex * 7);

  return mondayOfMonth;
};

const shiftSundayToSeven = (day: number): number => {
  return day === 0 ? 7 : day;
};

const getIsoWeekNumberFromDate = (date: Date): number => {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = shiftSundayToSeven(utcDate.getUTCDay());
  utcDate.setUTCDate(utcDate.getUTCDate() + (4 - dayNum));
  const isoYear = utcDate.getUTCFullYear();
  const startOfIsoYear = new Date(Date.UTC(isoYear, 0, 1));
  const daysSinceYearStart =
    (utcDate.getTime() - startOfIsoYear.getTime()) / 86400000 + 1;

  return Math.ceil(daysSinceYearStart / 7);
};

const getIsoWeek = (
  weekIndex: number,
  monthLabel: string,
  year: number
): number => {
  const monthIndex = getMonthIndex(monthLabel);
  const date = getDateForMonthWeek(year, monthIndex, weekIndex);

  return getIsoWeekNumberFromDate(date);
};

export default getIsoWeek;
