import type { CalendarDate } from '@internationalized/date';

import { generateCalendarRange } from './generateCalendarRange';

describe(generateCalendarRange.name, () => {
  it('should generate a range from the first day of the month to the last day of the month', () => {
    const firstWeekDates = [
      { year: 2022, month: 1, day: 1 },
      { year: 2022, month: 1, day: 2 },
      { year: 2022, month: 1, day: 3 },
      { year: 2022, month: 1, day: 4 },
      { year: 2022, month: 1, day: 5 },
      { year: 2022, month: 1, day: 6 },
      { year: 2022, month: 1, day: 7 },
    ];

    const lastWeekDates = [
      { year: 2022, month: 1, day: 25 },
      { year: 2022, month: 1, day: 26 },
      { year: 2022, month: 1, day: 27 },
      { year: 2022, month: 1, day: 28 },
      { year: 2022, month: 1, day: 29 },
      { year: 2022, month: 1, day: 30 },
      { year: 2022, month: 1, day: 31 },
    ];

    const range = generateCalendarRange(
      firstWeekDates as CalendarDate[],
      lastWeekDates as CalendarDate[]
    );

    expect(range).toEqual([
      new Date(2022, 0, 1).getTime(),
      new Date(2022, 0, 31, 23, 59, 59, 999).getTime(),
    ]);
  });
});
