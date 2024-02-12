import type { PostEntity } from '@services';
import React from 'react';

export enum TimeOfDay {
  NIGHT = 'night',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
}

export type CalendarEvent = {
  id: number;
  day: string;
  timestamp: number;
  time_of_day: TimeOfDay | null;
  habit_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type CalendarEventsDate = string;
export type CalendarEventsDateMap = Record<CalendarEventsDate, CalendarEvent[]>;

type CalendarEventsContextType = {
  addingCalendarEvent: boolean;
  fetchingCalendarEvents: boolean;
  calendarEventIdBeingDeleted: number;
  calendarEventsByDate: CalendarEventsDateMap;
  addCalendarEvent: (calendarEvent: PostEntity<CalendarEvent>) => Promise<void>;
  removeCalendarEvent: (calendarEventId: number) => Promise<void>;
  removeCalendarEventsByHabitId: (habitId: number) => void;
};

export const CalendarEventsContext =
  React.createContext<CalendarEventsContextType>({
    addingCalendarEvent: false,
    fetchingCalendarEvents: false,
    calendarEventIdBeingDeleted: 0,
    calendarEventsByDate: {},
    addCalendarEvent: (_: PostEntity<CalendarEvent>) => Promise.resolve(),
    removeCalendarEvent: (_: number) => Promise.resolve(),
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
