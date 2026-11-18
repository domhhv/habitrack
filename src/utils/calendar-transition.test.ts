import { it, expect, describe } from 'vitest';

import getCalendarPeriodDirection from './calendar-transition';

describe(getCalendarPeriodDirection.name, () => {
  it('slides forward to a later period', () => {
    expect(getCalendarPeriodDirection('2026-11-01', '2026-12-01')).toBe(
      'calendar-next'
    );
    expect(getCalendarPeriodDirection('2026-12-27', '2027-01-03')).toBe(
      'calendar-next'
    );
  });

  it('slides back to an earlier period', () => {
    expect(getCalendarPeriodDirection('2026-11-18', '2026-11-17')).toBe(
      'calendar-prev'
    );
  });

  it('stays still while the period is unchanged', () => {
    expect(getCalendarPeriodDirection('2026-11-01', '2026-11-01')).toBe('none');
  });
});
