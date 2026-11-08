import { it, expect, describe } from 'vitest';

import getCalendarHref from './calendar-href';

describe(getCalendarHref.name, () => {
  it('builds the path of each view for a date', () => {
    const date = { day: 22, month: 10, year: 2026 };

    expect(getCalendarHref('day', date)).toBe('/calendar/day/2026/10/22');
    expect(getCalendarHref('week', date)).toBe('/calendar/week/2026/10/22');
    expect(getCalendarHref('month', date)).toBe('/calendar/month/2026/10/22');
  });

  it('leaves out the date when none is given', () => {
    expect(getCalendarHref('month')).toBe('/calendar/month');
  });
});
