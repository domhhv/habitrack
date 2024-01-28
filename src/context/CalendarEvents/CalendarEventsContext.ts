import type { Habit } from '@context';
import React from 'react';

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

export const useCalendarEvents = () => {
  const context = React.useContext(CalendarEventsContext);

  if (!context) {
    throw new Error(
      'useCalendarEvents must be used within a CalendarEventsProvider'
    );
  }

  return context;
};
