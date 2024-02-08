import { Habit } from '@context';

import {
  Collections,
  type PostEntity,
  destroy,
  get,
  patch,
  post,
  type PatchEntity,
} from './supabase';

export const createHabit = async (body: PostEntity<Habit>) => {
  return post<Habit>(Collections.HABITS, body);
};

export const listHabits = async () => {
  return get<Habit[]>(Collections.HABITS);
};

export const patchHabit = (id: number, body: PatchEntity<Habit>) => {
  return patch<Habit>(Collections.HABITS, id, body);
};

export const destroyHabit = (id: number) => {
  return destroy<Habit>(Collections.HABITS, id);
};
