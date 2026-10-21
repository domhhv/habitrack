import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { it, expect, describe } from 'vitest';

import {
  isCalendarView,
  getCalendarRange,
  getFocusedCalendarDate,
} from './calendar-range';

const endOfDay = (year: number, month: number, day: number) => {
  return new CalendarDateTime(year, month, day, 23, 59, 59, 999);
};

describe('getCalendarRange', () => {
  it('covers the whole weeks around a month', () => {
    expect(
      getCalendarRange('month', new CalendarDate(2026, 10, 1), 'en-GB', 'mon')
    ).toEqual([new CalendarDateTime(2026, 9, 28), endOfDay(2026, 11, 1)]);
  });

  it('starts weeks on Sunday when the profile asks for it', () => {
    expect(
      getCalendarRange('week', new CalendarDate(2026, 10, 22), 'en-GB', 'sun')
    ).toEqual([new CalendarDateTime(2026, 10, 18), endOfDay(2026, 10, 24)]);
  });

  it('falls back to the locale week start without a profile', () => {
    expect(
      getCalendarRange(
        'week',
        new CalendarDate(2026, 10, 22),
        'en-US',
        undefined
      )
    ).toEqual([new CalendarDateTime(2026, 10, 18), endOfDay(2026, 10, 24)]);
  });

  it('covers a single day', () => {
    expect(
      getCalendarRange('day', new CalendarDate(2026, 10, 22), 'en-GB', 'mon')
    ).toEqual([new CalendarDateTime(2026, 10, 22), endOfDay(2026, 10, 22)]);
  });
});

describe('getFocusedCalendarDate', () => {
  it('uses the date from the URL params', () => {
    expect(
      getFocusedCalendarDate(
        'day',
        { day: '9', month: '3', year: '2025' },
        'en-GB',
        'mon',
        'UTC'
      )
    ).toEqual(new CalendarDate(2025, 3, 9));
  });

  it('defaults a month view to the first day of the current month', () => {
    expect(getFocusedCalendarDate('month', {}, 'en-GB', 'mon', 'UTC').day).toBe(
      1
    );
  });
});

describe('isCalendarView', () => {
  it('accepts only known calendar views', () => {
    expect(isCalendarView('week')).toBe(true);
    expect(isCalendarView('year')).toBe(false);
    expect(isCalendarView(undefined)).toBe(false);
  });
});
