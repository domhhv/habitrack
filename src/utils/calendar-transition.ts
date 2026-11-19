export type CalendarPeriodDirection =
  'calendar-next' | 'calendar-prev' | 'none';

/**
 * Periods are ISO dates of their first day, so comparing the strings orders them.
 */
const getCalendarPeriodDirection = (
  shownPeriod: string,
  period: string
): CalendarPeriodDirection => {
  if (shownPeriod === period) {
    return 'none';
  }

  return period > shownPeriod ? 'calendar-next' : 'calendar-prev';
};

export default getCalendarPeriodDirection;
