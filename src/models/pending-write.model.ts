import type { NotePeriodKind } from './note.model';
import type { OccurrenceValuesSubmission } from './occurrence-submission.model';

export type PendingOccurrenceCreate = {
  id: string;
  photoPaths: string[];
  values: OccurrenceValuesSubmission;
};

export type PendingOccurrenceUpdate = {
  noteId: string | null;
  occurrenceId: string;
  photoPaths: string[];
  values: OccurrenceValuesSubmission;
};

export type PendingNoteCreate = {
  content: string;
  id: string;
  periodDate: string;
  periodKind: NonNullable<NotePeriodKind>;
};

/**
 * Calendar writes that are still submitting or revalidating, read from `useFetchers()`.
 */
export type PendingCalendarWrites = {
  createdNotes: PendingNoteCreate[];
  createdOccurrences: PendingOccurrenceCreate[];
  deletedNoteIds: string[];
  deletedOccurrenceIds: string[];
  removedMetricValues: { habitMetricId: string; occurrenceId: string }[];
  updatedNotes: { content: string; noteId: string }[];
  updatedOccurrences: PendingOccurrenceUpdate[];
};

/**
 * Habit and stock writes that are still submitting or revalidating, read from `useFetchers()`.
 */
export type PendingHabitWrites = {
  deletedHabitIds: string[];
  removedStockIds: string[];
  stockDepletion: Record<string, boolean>;
};
