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

export async function updateHabit(id: number, habit: Omit<Habit, 'id'>) {
  const response = await fetch(`${process.env.API_BASE_URL}/habits/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habit),
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  const data: Habit = await response.json();

  return data;
}

export async function deleteHabit(id: number) {
  const response = await fetch(`${process.env.API_BASE_URL}/habits/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  const data = await response.json();

  return data;
}
