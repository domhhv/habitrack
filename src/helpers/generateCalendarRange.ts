export const generateCalendarRange = (
  year: number,
  month: number
): [number, number] => {
  const rangeStart = new Date(year, month - 1);
  const rangeEnd = new Date(year, month, 0, 23, 59, 59, 999);

  if (rangeStart.getDay() !== 1) {
    rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay() + 1);
  }

  if (rangeEnd.getDay() !== 0) {
    rangeEnd.setDate(rangeEnd.getDate() + (7 - rangeEnd.getDay()));
  }

  return [+rangeStart, +rangeEnd];
};
