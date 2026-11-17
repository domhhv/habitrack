import { useFetchers, useRouteLoaderData } from 'react-router';

import type { Habit } from '@models';
import { type CalendarData, applyPendingCalendarWrites } from '@services';
import { collectPendingCalendarWrites } from '@utils';

import type { clientLoader } from '../pages/CalendarLayout';

import useHabits from './use-habits';

const NO_CALENDAR_DATA: Omit<CalendarData, 'range'> = {
  dayNotes: [],
  monthNotes: [],
  notesByOccurrenceId: {},
  occurrences: [],
  occurrencesByDate: {},
  periodNotes: [],
  weekNotes: [],
};

/**
 * Every cell and chip reads the calendar data, so the merged result is shared between them for as
 * long as the loaded data, the habits and the pending writes stay the same.
 */
const mergedCalendarData = new WeakMap<
  CalendarData,
  {
    habits: Record<Habit['id'], Habit>;
    result: CalendarData;
    signature: string;
  }
>();

/**
 * The calendar layout's data with the calendar writes that are still in flight already applied.
 */
const useCalendarData = () => {
  const data = useRouteLoaderData<typeof clientLoader>('calendar');
  const habits = useHabits();
  const pendingWrites = collectPendingCalendarWrites(useFetchers());

  if (!data) {
    return NO_CALENDAR_DATA;
  }

  if (!pendingWrites) {
    return data;
  }

  const signature = JSON.stringify(pendingWrites);
  const cached = mergedCalendarData.get(data);

  if (cached?.signature === signature && cached.habits === habits) {
    return cached.result;
  }

  const result = applyPendingCalendarWrites(data, pendingWrites, habits);

  mergedCalendarData.set(data, { habits, result, signature });

  return result;
};

export default useCalendarData;
