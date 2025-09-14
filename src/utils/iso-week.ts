export function getISOWeek(value: Date) {
  const date = new Date(value.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
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
}

export function getISOWeekYear(value: Date) {
  const date = new Date(value.getTime());
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  return date.getFullYear();
}
