import { type Habit } from './habit.model';
import { type Trait } from './trait.model';

export type Occurrence = {
  id: number;
  createdAt: string;
  updatedAt: string | null;
  timestamp: number;
  day: string;
  time: string | null;
  userId: string;
  habitId: number;
  habit:
    | (Pick<Habit, 'name' | 'iconPath'> & {
        trait: Pick<Trait, 'id' | 'name' | 'color'> | null;
      })
    | null;
};

type OccurrenceDate = string;
export type OccurrencesDateMap = Record<OccurrenceDate, Occurrence[]>;
