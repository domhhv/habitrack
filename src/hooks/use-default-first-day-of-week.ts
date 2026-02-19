import { useLocale, useCalendar, useCalendarGrid } from 'react-aria';
import { useCalendarState } from 'react-stately';

import { createCalendar } from '@utils';

const useDefaultFirstDayOfWeek = () => {
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    createCalendar,
    locale,
  });
  useCalendar({}, calendarState);
  const {
    weekDays: [firstDayOfWeek],
  } = useCalendarGrid({}, calendarState);

  return firstDayOfWeek;
};

export default useDefaultFirstDayOfWeek;
