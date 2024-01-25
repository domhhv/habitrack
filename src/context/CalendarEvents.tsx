import { calendarService } from '@services';
import React from 'react';

import { Habit } from './Habits';
import { useUser } from './User';

export type CalendarEvent = {
  id: number;
  date: string;
  habit: Habit;
};

const CalendarEventsContext = React.createContext({
  fetchingCalendarEvents: false,
  calendarEvents: [] as CalendarEvent[],
  addCalendarEvent: (_: CalendarEvent) => {},
  removeCalendarEvent: (_: number) => {},
  updateHabitInsideCalendarEvents: (_: Habit) => {},
});

export const useCalendarEvents = () => {
  const context = React.useContext(CalendarEventsContext);

  if (!context) {
    throw new Error(
      'useCalendarEvents must be used within a CalendarEventsProvider'
    );
  }

  return context;
};

type Props = {
  children: React.ReactNode;
};

export default function CalendarEventsProvider({ children }: Props) {
  const { accessToken } = useUser();
  const [fetchingCalendarEvents, setFetchingCalendarEvents] =
    React.useState(false);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    []
  );

  React.useEffect(() => {
    console.log('accessToken', accessToken);
    const loadCalendarEvents = async () => {
      if (!accessToken) {
        clearCalendarEvents();
        return null;
      }

      setFetchingCalendarEvents(true);
      const calendarEvents = await calendarService.getCalendarEvents(
        accessToken as string
      );
      setCalendarEvents(calendarEvents);
      setFetchingCalendarEvents(false);
    };

    void loadCalendarEvents();
  }, [accessToken]);

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

  const clearCalendarEvents = () => {
    setCalendarEvents([]);
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
