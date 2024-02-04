import type { Habit } from '@context';
import React from 'react';

export type CalendarEvent = {
  id: number;
  date: string;
  habit: Habit;
};

export type CreatedCalendarEvent = Omit<CalendarEvent, 'id' | 'habit'> & {
  habitId: number;
};

type CalendarEventsDate = string;
export type CalendarEventsDateMap = Record<CalendarEventsDate, CalendarEvent[]>;

type CalendarEventsContextType = {
  addingCalendarEvent: boolean;
  fetchingCalendarEvents: boolean;
  calendarEventIdBeingDeleted: number;
  calendarEventsByDate: CalendarEventsDateMap;
  addCalendarEvent: (calendarEvent: CreatedCalendarEvent) => Promise<void>;
  removeCalendarEvent: (calendarEventId: number) => Promise<void>;
  updateHabitInsideCalendarEvents: (habit: Habit) => void;
  removeCalendarEventsByHabitId: (habitId: number) => void;
};

export const CalendarEventsContext =
  React.createContext<CalendarEventsContextType>({
    addingCalendarEvent: false,
    fetchingCalendarEvents: false,
    calendarEventIdBeingDeleted: 0,
    calendarEventsByDate: {},
    addCalendarEvent: (_: CreatedCalendarEvent) => Promise.resolve(),
    removeCalendarEvent: (_: number) => Promise.resolve(),
    updateHabitInsideCalendarEvents: (_: Habit) => {},
    removeCalendarEventsByHabitId: (_: number) => {},
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
