import { CalendarEvent, type LocalUser } from '@context';

import { composeAuthorizationHeader, destroy, get, patch, post } from './http';

export const createCalendarEvent = (
  date: Date,
  habitId: number,
  user: LocalUser
) => {
  return post<CalendarEvent>(
    `/users/${user.id}/calendar-events`,
    {
      date: date.toISOString(),
      habit: habitId,
    },
    composeAuthorizationHeader(user.token)
  );
};

export const getCalendarEvents = (user: LocalUser) => {
  return get<CalendarEvent[]>(
    `/users/${user.id}/calendar-events`,
    composeAuthorizationHeader(user.token)
  );
};

export const updateCalendarEvent = (
  id: number,
  calendarEvent: Omit<CalendarEvent, 'id'>,
  user: LocalUser
) => {
  return patch<CalendarEvent>(
    `/users/${user.id}/calendar-events/${id}`,
    calendarEvent,
    composeAuthorizationHeader(user.token)
  );
};

export const destroyCalendarEvent = (id: number, user: LocalUser) => {
  return destroy<CalendarEvent>(
    `/users/${user.id}/calendar-events/${id}`,
    composeAuthorizationHeader(user.token)
  );
};
