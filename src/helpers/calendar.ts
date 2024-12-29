const SUNDAY = 0;
const MONDAY = 1;
const SATURDAY = 6;

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

const monthNames = [
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

function getMonthIndex(monthLabel: string) {
  return monthNames.indexOf(monthLabel);
}

function getDateForMonthWeek(
  year: number,
  monthIndex: number,
  weekIndex: number
) {
  // 1) Start at the 1st day of the month
  const date = new Date(year, monthIndex, 1);

  // 2) dayOfWeek in JS: Sunday=0, Monday=1, ..., Saturday=6
  //    For Monday-start, let's shift it so Monday=0, Tuesday=1, ... Sunday=6
  const dayOfWeek = (date.getDay() + SATURDAY) % SUNDAY;

  // 3) Move 'date' back to the Monday of that “0th week”
  date.setDate(date.getDate() - dayOfWeek);

  // 4) Now jump 'weekIndex' weeks forward
  date.setDate(date.getDate() + weekIndex * 7);

  return date;
}

function getISOWeekNumber(date: Date) {
  // Convert to UTC to avoid time-zone edge cases
  const tempDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  // ISO week date weeks start on Monday, so let's find the Thursday in the current week
  const dayNum = tempDate.getUTCDay() || 7; // Make Sunday (0) become 7
  tempDate.setUTCDate(tempDate.getUTCDate() + (4 - dayNum));

  // Now tempDate is Thursday of the current ISO week
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));

  // Calculate full weeks to the nearest Thursday
  const weekNo = Math.ceil(
    ((Number(tempDate) - Number(yearStart)) / 86400000 + 1) / 7
  );

  return weekNo;
}

export function getYearWeekNumberFromMonthWeek(
  monthLabel: string,
  year: number,
  weekIndex: number
) {
  // 1) Convert month label to index
  const monthIndex = getMonthIndex(monthLabel);

  // 2) Get the date that corresponds to the Monday of that “month-level week index”
  const specificDate = getDateForMonthWeek(year, monthIndex, weekIndex);

  // 3) Get the ISO week number from that date
  const weekOfYear = getISOWeekNumber(specificDate);

  return weekOfYear;
}
