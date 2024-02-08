import { CalendarEvent } from '@context';

import {
  Collections,
  type PostEntity,
  destroy,
  get,
  patch,
  post,
  type PatchEntity,
} from './supabase';

export const createCalendarEvent = (
  calendarEvent: PostEntity<CalendarEvent>
) => {
  return post<CalendarEvent>(Collections.CALENDAR_EVENTS, calendarEvent);
};

export const listCalendarEvents = () => {
  return get<CalendarEvent[]>(Collections.CALENDAR_EVENTS);
};

export const updateCalendarEvent = (
  id: number,
  calendarEvent: PatchEntity<CalendarEvent>
) => {
  return patch<CalendarEvent>(Collections.CALENDAR_EVENTS, id, calendarEvent);
};

export const destroyCalendarEvent = (id: number) => {
  return destroy<CalendarEvent>(Collections.CALENDAR_EVENTS, id);
};
