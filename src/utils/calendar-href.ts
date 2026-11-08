import { href } from 'react-router';

import type { CalendarView } from './calendar-range';

type CalendarHrefDate = { day: number; month: number; year: number };

/**
 * Every calendar view is its own route, so `href()` needs the view's literal path pattern.
 */
const getCalendarHref = (view: CalendarView, date?: CalendarHrefDate) => {
  const params = date
    ? {
        day: String(date.day),
        month: String(date.month),
        year: String(date.year),
      }
    : {};

  switch (view) {
    case 'day':
      return href('/calendar/day/:year?/:month?/:day?', params);

    case 'month':
      return href('/calendar/month/:year?/:month?/:day?', params);

    case 'week':
      return href('/calendar/week/:year?/:month?/:day?', params);
  }
};

export default getCalendarHref;
