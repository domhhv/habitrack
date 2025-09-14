import type { CalendarDate, CalendarDateTime } from '@internationalized/date';

const toSqlDate = ({
  day,
  month,
  year,
}: CalendarDate | CalendarDateTime): string => {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

export default toSqlDate;
