import type { PatchEntity, PostEntity } from '@services';

export type ServerHabit = {
  id: number;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  trait_id: number;
  icon_path: string | null;
};

export type Habit = {
  id: number;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  traitId: number;
  iconPath: string | null;
};

type HabitId = string;
export type HabitsMap = Record<HabitId, Habit>;

export type AddHabit = PostEntity<Omit<Habit, 'iconPath'>>;

export type UpdateHabit = PatchEntity<Habit>;
