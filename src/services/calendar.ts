import {
  CalendarEvent,
  type CreatedCalendarEvent,
  type LocalUser,
} from '@context';

import { composeAuthorizationHeader, destroy, get, patch, post } from './http';

export const createCalendarEvent = (
  calendarEvent: CreatedCalendarEvent,
  user: LocalUser
) => {
  return post<CalendarEvent>(
    `/users/${user.id}/calendar-events`,
    calendarEvent,
    composeAuthorizationHeader(user.accessToken)
  );
};

export const getCalendarEvents = (user: LocalUser) => {
  return get<CalendarEvent[]>(
    `/users/${user.id}/calendar-events`,
    composeAuthorizationHeader(user.accessToken)
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
    composeAuthorizationHeader(user.accessToken)
  );
};

export const destroyCalendarEvent = (id: number, user: LocalUser) => {
  return destroy<CalendarEvent>(
    `/users/${user.id}/calendar-events/${id}`,
    composeAuthorizationHeader(user.accessToken)
  );
};
