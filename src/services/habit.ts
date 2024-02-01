import { Habit, type LocalUser } from '@context';

import { composeAuthorizationHeader, destroy, get, patch, post } from './http';

export const createHabit = (
  name: string,
  description: string,
  trait: 'good' | 'bad',
  user: LocalUser
) => {
  return post<Habit>(
    `/users/${user.id}/habits`,
    {
      name,
      description,
      trait,
    },
    composeAuthorizationHeader(user.token)
  );
};

export const getHabits = (user: LocalUser) => {
  return get<Habit[]>(
    `/users/${user.id}/habits`,
    composeAuthorizationHeader(user.token)
  );
};

export const updateHabit = (
  id: number,
  habit: Omit<Habit, 'id'>,
  user: LocalUser
) => {
  return patch<Habit>(
    `/users/${user.id}/habits/${id}`,
    habit,
    composeAuthorizationHeader(user.token)
  );
};

export const destroyHabit = (id: number, user: LocalUser) => {
  return destroy<Habit>(
    `/users/${user.id}/habits/${id}`,
    composeAuthorizationHeader(user.token)
  );
};
