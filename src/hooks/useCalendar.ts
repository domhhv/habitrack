import {
  type CalendarDate,
  getWeeksInMonth,
  GregorianCalendar,
} from '@internationalized/date';
import { generateCalendarRange } from '@utils';
import { useLocale } from 'react-aria';
import { useCalendarState } from 'react-stately';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();
    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const useCalendar = () => {
  const { locale } = useLocale();
  const state = useCalendarState({
    locale,
    createCalendar,
  });
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);
  const weeks = [...new Array(weeksInMonth).keys()];
  const { rangeStart, rangeEnd } = generateCalendarRange(
    state.getDatesInWeek(0) as CalendarDate[],
    state.getDatesInWeek(weeks[weeks.length - 1]) as CalendarDate[]
  );

  return { rangeStart, rangeEnd, state, weeksInMonth };
};

export default useCalendar;
