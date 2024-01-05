import { Habit } from '@context';

export async function createHabit(
  name: string,
  description: string,
  trait: 'good' | 'bad'
) {
  const response = await fetch(`${process.env.API_BASE_URL}/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      trait,
    }),
  });

  const data: Habit = await response.json();

  return data;
}

export async function getHabits() {
  const response = await fetch(`${process.env.API_BASE_URL}/habits`);

  const data: Habit[] = await response.json();

  return data;
}
