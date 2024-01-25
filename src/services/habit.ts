import { Habit } from '@context';

import { composeAuthorizationHeader, destroy, get, patch, post } from './http';

export const createHabit = (
  name: string,
  description: string,
  trait: 'good' | 'bad',
  accessToken: string
) => {
  return post<Habit>(
    '/habits',
    {
      name,
      description,
      trait,
    },
    composeAuthorizationHeader(accessToken)
  );
};

export const getHabits = (accessToken: string) => {
  return get<Habit[]>('/habits', composeAuthorizationHeader(accessToken));
};

export const updateHabit = (
  id: number,
  habit: Omit<Habit, 'id'>,
  accessToken: string
) => {
  return patch<Habit>(
    `/habits/${id}`,
    habit,
    composeAuthorizationHeader(accessToken)
  );
};

export const destroyHabit = (id: number, accessToken: string) => {
  return destroy<Habit>(
    `/habits/${id}`,
    composeAuthorizationHeader(accessToken)
  );
};
