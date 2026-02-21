import { useLocale, useCalendar, useCalendarGrid } from 'react-aria';
import { useCalendarState } from 'react-stately';

import type { DaysOfWeek } from '@models';
import { createCalendar } from '@utils';

const isDayOfWeek = (value: string): value is DaysOfWeek => {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(value);
};

const useDefaultFirstDayOfWeek = (): DaysOfWeek => {
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    createCalendar,
    locale,
  });
  useCalendar({}, calendarState);
  const {
    weekDays: [firstDayOfWeekLabel],
  } = useCalendarGrid({ weekdayStyle: 'short' }, calendarState);

  const firstDayOfWeek = firstDayOfWeekLabel.toLowerCase();

  if (!isDayOfWeek(firstDayOfWeek)) {
    throw new Error(`Invalid first day of week: ${firstDayOfWeek}`);
  }

  return firstDayOfWeek;
};

export default useDefaultFirstDayOfWeek;
