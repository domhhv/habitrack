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

const getIsoWeek = (date: Date): number => {
  return getIsoWeekNumberFromDate(date);
};

export default getIsoWeek;
