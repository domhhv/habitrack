type Year = `${number}${number}${number}${number}`;

type Month =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12';

type Day =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | '23'
  | '24'
  | '25'
  | '26'
  | '27'
  | '28'
  | '29'
  | '30'
  | '31';

export type CalendarDay = `${Year}-${Month}-${Day}`;

export const isCalendarDay = (value: string): value is CalendarDay => {
  return /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(value);
};

const SUNDAY = 0;
const MONDAY = 1;

export const generateCalendarRange = (
  year: number,
  month: number
): [number, number] => {
  const rangeStart = new Date(year, month - 1);
  const rangeEnd = new Date(year, month, 0, 23, 59, 59, 999);

  if (rangeStart.getDay() === SUNDAY) {
    rangeStart.setDate(rangeStart.getDate() - 6);
  }

  if (rangeStart.getDay() !== SUNDAY && rangeStart.getDay() !== MONDAY) {
    rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay() + 1);
  }

  if (rangeEnd.getDay() !== SUNDAY) {
    rangeEnd.setDate(rangeEnd.getDate() + (7 - rangeEnd.getDay()));
  }

  return [+rangeStart, +rangeEnd];
};

const MONTH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthIndex(monthLabel: string): number {
  return MONTH.indexOf(monthLabel);
}

function getMondayOffset(day: number): number {
  return (day + 6) % 7;
}

function getFirstMondayOfMonth(year: number, monthIndex: number): Date {
  const firstDay = new Date(year, monthIndex, 1);
  const offset = getMondayOffset(firstDay.getDay());
  firstDay.setDate(firstDay.getDate() - offset);
  return firstDay;
}

function getDateForMonthWeek(
  year: number,
  monthIndex: number,
  weekIndex: number
): Date {
  const mondayOfMonth = getFirstMondayOfMonth(year, monthIndex);
  mondayOfMonth.setDate(mondayOfMonth.getDate() + weekIndex * 7);
  return mondayOfMonth;
}

function shiftSundayToSeven(day: number): number {
  return day === 0 ? 7 : day;
}

function getISOWeekYearAndNumber(date: Date): { year: number; week: number } {
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
}

export function getYearWeekNumberFromMonthWeek(
  monthLabel: string,
  year: number,
  weekIndex: number
): { year: number; week: number } {
  const monthIndex = getMonthIndex(monthLabel);
  const date = getDateForMonthWeek(year, monthIndex, weekIndex);
  return getISOWeekYearAndNumber(date);
}
