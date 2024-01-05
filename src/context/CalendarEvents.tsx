import { getCalendarEvents } from '@actions';
import React from 'react';

import { Habit } from './Habits';

export type CalendarEvent = {
  id: number;
  date: string;
  habit: Habit;
};

export const CalendarEventsContext = React.createContext({
  calendarEvents: [] as CalendarEvent[],
  setCalendarEvents: (
    _: CalendarEvent[] | ((prevHabits: CalendarEvent[]) => CalendarEvent[])
  ) => {},
});

type Props = {
  children: React.ReactNode;
};

export default function CalendarEventsProvider({ children }: Props) {
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    []
  );

  React.useEffect(() => {
    getCalendarEvents().then(setCalendarEvents);
  }, []);

  const value = React.useMemo(
    () => ({ calendarEvents, setCalendarEvents }),
    [calendarEvents]
  );

  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
}
