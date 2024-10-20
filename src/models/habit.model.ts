import { type Trait } from './trait.model';

export type Habit = {
  id: number;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  traitId: number;
  trait: Pick<Trait, 'name' | 'color'> | null;
  iconPath: string | null;
};

type HabitId = string;
export type HabitsMap = Record<HabitId, Habit>;
