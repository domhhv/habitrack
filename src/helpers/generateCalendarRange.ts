const SUNDAY = 0;
const MONDAY = 1;

const generateCalendarRange = (
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

export default generateCalendarRange;
