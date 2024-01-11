import { CalendarEvent } from '@context';

export async function createCalendarEvent(
  date: Date,
  habitId: number,
  accessToken: string
) {
  const response = await fetch(`${process.env.API_BASE_URL}/calendar-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      date: date.toISOString(),
      habit: habitId,
    }),
  });

  const data: CalendarEvent = await response.json();

  return data;
}

export async function getCalendarEvents(accessToken: string) {
  const response = await fetch(`${process.env.API_BASE_URL}/calendar-events`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data: CalendarEvent[] = await response.json();

  return data;
}

export async function deleteCalendarEvent(id: number, accessToken: string) {
  const response = await fetch(
    `${process.env.API_BASE_URL}/calendar-events/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  const data = await response.json();

  return data;
}
