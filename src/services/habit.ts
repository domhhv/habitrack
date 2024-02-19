import { type AddHabit, type Habit, type ServerHabit } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

import {
  Collections,
  destroy,
  get,
  patch,
  post,
  type PatchEntity,
} from './supabase';

export const createHabit = async (body: AddHabit): Promise<Habit> => {
  const serverBody: ServerHabit = transformClientEntity(body);

  const habit = await post<ServerHabit>(Collections.HABITS, serverBody);

  return transformServerEntity(habit) as unknown as Habit;
};

export const listHabits = async () => {
  const habits = await get<ServerHabit>(Collections.HABITS);

  return transformServerEntities(habits) as unknown as Habit[];
};

export const patchHabit = async (id: number, body: PatchEntity<Habit>) => {
  const serverUpdates: ServerHabit = transformClientEntity(body);

  const habit = await patch<ServerHabit>(Collections.HABITS, id, serverUpdates);

  return transformServerEntity(habit) as unknown as Habit;
};

export const destroyHabit = (id: number) => {
  return destroy<ServerHabit>(Collections.HABITS, id);
};
