import type { PostEntity } from '@services';

export type Occurrence = {
  id: number;
  createdAt: string;
  updatedAt: string;
  timestamp: number;
  day: string;
  time: string | null;
  habitId: number;
  userId: string;
};

type OccurrenceDate = string;
export type OccurrencesDateMap = Record<OccurrenceDate, Occurrence[]>;

export type ServerOccurrence = {
  id: number;
  created_at: string;
  updated_at: string;
  timestamp: number;
  day: string;
  time: string | null;
  habit_id: number | null;
  user_id: string;
};

export type AddOccurrence = PostEntity<Occurrence>;
