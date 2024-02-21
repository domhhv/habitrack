import type { PatchEntity, PostEntity } from '@services';

export type ServerHabit = {
  id: number;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  icon_path?: string;
  trait_id: number;
};

export type Habit = {
  id: number;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  iconPath?: string;
  traitId: number;
};

type HabitId = string;
export type HabitsMap = Record<HabitId, Habit>;

export type AddHabit = PostEntity<
  Omit<Habit, 'createdAt' | 'updatedAt' | 'iconPath'>
>;

export type UpdateHabit = PatchEntity<Habit>;
