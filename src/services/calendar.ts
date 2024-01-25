import { CalendarEvent } from '@context';

import { composeAuthorizationHeader, destroy, get, patch, post } from './http';

export const createCalendarEvent = (
  date: Date,
  habitId: number,
  accessToken: string
) => {
  return post<CalendarEvent>(
    '/calendar-events',
    {
      date: date.toISOString(),
      habit: habitId,
    },
    composeAuthorizationHeader(accessToken)
  );
};

export const getCalendarEvents = (accessToken: string) => {
  return get<CalendarEvent[]>(
    '/calendar-events',
    composeAuthorizationHeader(accessToken)
  );
};

export const updateCalendarEvent = (
  id: number,
  calendarEvent: Omit<CalendarEvent, 'id'>,
  accessToken: string
) => {
  return patch<CalendarEvent>(
    `/calendar-events/${id}`,
    calendarEvent,
    composeAuthorizationHeader(accessToken)
  );
};

export const destroyCalendarEvent = (id: number, accessToken: string) => {
  return destroy<CalendarEvent>(
    `/calendar-events/${id}`,
    composeAuthorizationHeader(accessToken)
  );
};
