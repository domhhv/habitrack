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

const getISOWeekYearAndNumber = (
  date: Date
): { year: number; week: number } => {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = shiftSundayToSeven(utcDate.getUTCDay());
  utcDate.setUTCDate(utcDate.getUTCDate() + (4 - dayNum));
  const isoYear = utcDate.getUTCFullYear();
  const startOfIsoYear = new Date(Date.UTC(isoYear, 0, 1));
  const daysSinceYearStart =
    (utcDate.getTime() - startOfIsoYear.getTime()) / 86400000 + 1;
  const weekNumber = Math.ceil(daysSinceYearStart / 7);

  return { year: isoYear, week: weekNumber };
};

const getYearWeekNumberFromMonthWeek = (
  monthLabel: string,
  year: number,
  weekIndex: number
): { year: number; week: number } => {
  const monthIndex = getMonthIndex(monthLabel);
  const date = getDateForMonthWeek(year, monthIndex, weekIndex);

  return getISOWeekYearAndNumber(date);
};

export default getYearWeekNumberFromMonthWeek;
