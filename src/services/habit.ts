import { Habit, type LocalUser } from '@context';

import { composeAuthorizationHeader, destroy, get, patch, post } from './http';

export const createHabit = (habit: Omit<Habit, 'id'>, user: LocalUser) => {
  return post<Habit>(
    `/users/${user.id}/habits`,
    habit,
    composeAuthorizationHeader(user.accessToken)
  );
};

export const getHabits = (user: LocalUser) => {
  return get<Habit[]>(
    `/users/${user.id}/habits`,
    composeAuthorizationHeader(user.accessToken)
  );
};

export const updateHabit = (habit: Habit, user: LocalUser) => {
  return patch<Habit>(
    `/users/${user.id}/habits/${habit.id}`,
    habit,
    composeAuthorizationHeader(user.accessToken)
  );
};

export const destroyHabit = (id: number, user: LocalUser) => {
  return destroy<Habit>(
    `/users/${user.id}/habits/${id}`,
    composeAuthorizationHeader(user.accessToken)
  );
};
