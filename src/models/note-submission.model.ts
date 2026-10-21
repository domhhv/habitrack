import type { NotePeriodKind } from './note.model';

export type PeriodNoteFields = {
  content: string;
  periodDate: string;
  periodKind: NonNullable<NotePeriodKind>;
};

export type NoteSubmission =
  | { intent: 'create'; note: PeriodNoteFields }
  | { intent: 'delete'; noteId: string }
  | { intent: 'update'; note: PeriodNoteFields; noteId: string };
