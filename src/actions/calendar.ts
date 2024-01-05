import { CalendarEvent } from '@context';

export async function createCalendarEvent(date: Date, habitId: number) {
  const response = await fetch(`${process.env.API_BASE_URL}/calendar-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: date.toISOString(),
      habit: habitId,
    }),
  });

  const data: CalendarEvent = await response.json();

  return data;
}

export async function getCalendarEvents() {
  const response = await fetch(`${process.env.API_BASE_URL}/calendar-events`);

  const data: CalendarEvent[] = await response.json();

  return data;
}
