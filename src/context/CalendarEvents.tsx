import { calendarActions } from '@actions';
import React from 'react';

import { Habit } from './Habits';

export type CalendarEvent = {
  id: number;
  date: string;
  habit: Habit;
};

export const CalendarEventsContext = React.createContext({
  fetchingCalendarEvents: false,
  calendarEvents: [] as CalendarEvent[],
  addCalendarEvent: (_: CalendarEvent) => {},
  removeCalendarEvent: (_: number) => {},
  updateHabitInsideCalendarEvents: (_: Habit) => {},
});

type Props = {
  children: React.ReactNode;
};

export default function CalendarEventsProvider({ children }: Props) {
  const [fetchingCalendarEvents, setFetchingCalendarEvents] =
    React.useState(false);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    []
  );

  React.useEffect(() => {
    const loadCalendarEvents = async () => {
      setFetchingCalendarEvents(true);
      const calendarEvents = await calendarActions.getCalendarEvents();
      setCalendarEvents(calendarEvents);
      setFetchingCalendarEvents(false);
    };

    void loadCalendarEvents();
  }, []);

  const addCalendarEvent = (calendarEvent: CalendarEvent) => {
    setCalendarEvents((prevCalendarEvents) => [
      ...prevCalendarEvents,
      calendarEvent,
    ]);
  };

  const removeCalendarEvent = (id: number) => {
    setCalendarEvents((prevCalendarEvents) =>
      prevCalendarEvents.filter(
        (prevCalendarEvent) => prevCalendarEvent.id !== id
      )
    );
  };

  const updateHabitInsideCalendarEvents = (habit: Habit) => {
    setCalendarEvents((prevCalendarEvents) =>
      prevCalendarEvents.map((prevCalendarEvent) =>
        prevCalendarEvent.habit.id === habit.id
          ? {
              ...prevCalendarEvent,
              habit,
            }
          : prevCalendarEvent
      )
    );
  };

  const value = React.useMemo(
    () => ({
      fetchingCalendarEvents,
      calendarEvents,
      addCalendarEvent,
      removeCalendarEvent,
      updateHabitInsideCalendarEvents,
    }),
    [calendarEvents, fetchingCalendarEvents]
  );

  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
}
