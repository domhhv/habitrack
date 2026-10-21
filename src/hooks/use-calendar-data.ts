import { useRouteLoaderData } from 'react-router';

import type { CalendarData } from '@services';

import type { clientLoader } from '../pages/CalendarLayout';

const NO_CALENDAR_DATA: CalendarData = {
  dayNotes: [],
  monthNotes: [],
  notesByOccurrenceId: {},
  occurrences: [],
  occurrencesByDate: {},
  periodNotes: [],
  weekNotes: [],
};

const useCalendarData = () => {
  return (
    useRouteLoaderData<typeof clientLoader>('calendar') ?? NO_CALENDAR_DATA
  );
};

export default useCalendarData;
