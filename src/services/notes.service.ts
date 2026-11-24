import type { ZonedDateTime } from '@internationalized/date';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Tables, TablesInsert } from '@db-types';
import type {
  Note,
  NotesUpdate,
  NotesInsert,
  NoteWithHabit,
  NotePeriodKind,
  TypedSupabaseClient,
} from '@models';
import type { NotesCursor } from '@utils';

export const createNote = async (
  supabase: TypedSupabaseClient,
  note: NotesInsert
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert(decamelizeKeys(note) as TablesInsert<'notes'>)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const listNotes = async (
  supabase: TypedSupabaseClient,
  [rangeStart, rangeEnd]: [ZonedDateTime, ZonedDateTime]
): Promise<Note[]> => {
  const startDateString = rangeStart.toAbsoluteString();
  const endDateString = rangeEnd.toAbsoluteString();

  const periodNotesPromise = supabase
    .from('notes')
    .select()
    .in('period_kind', ['day', 'week', 'month'])
    .gte('period_date', startDateString)
    .lte('period_date', endDateString);

  const occurrenceNotesPromise = supabase
    .from('occurrences')
    .select('note:notes!inner(*)')
    .gte('occurred_at', startDateString)
    .lte('occurred_at', endDateString);

  const [periodResult, occurrenceResult] = await Promise.all([
    periodNotesPromise,
    occurrenceNotesPromise,
  ]);

  if (periodResult.error) {
    throw new Error(periodResult.error.message);
  }

  if (occurrenceResult.error) {
    throw new Error(occurrenceResult.error.message);
  }

  const notesMap = new Map<string, Tables<'notes'>>();

  const occurrenceNotes = occurrenceResult.data.map(({ note }) => {
    return note;
  });

  for (const note of [...periodResult.data, ...occurrenceNotes]) {
    notesMap.set(note.id, note);
  }

  return camelcaseKeys([...notesMap.values()], { deep: true });
};

export const getPeriodNote = async (
  supabase: TypedSupabaseClient,
  periodKind: NonNullable<NotePeriodKind>,
  periodDate: string,
  signal?: AbortSignal
): Promise<Note | null> => {
  const query = supabase
    .from('notes')
    .select()
    .eq('period_kind', periodKind)
    .eq('period_date', periodDate)
    .order('created_at')
    .limit(1);

  const { data, error } = await (
    signal ? query.abortSignal(signal) : query
  ).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data && camelcaseKeys(data);
};

export const updateNote = async (
  supabase: TypedSupabaseClient,
  id: Note['id'],
  note: NotesUpdate
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update(decamelizeKeys(note))
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data[0]);
};

export const destroyNote = async (
  supabase: TypedSupabaseClient,
  id: Note['id']
) => {
  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export type ListNotesPageParams = {
  before: NotesCursor | null;
  limit: number;
  signal: AbortSignal;
  userId: string;
};

export type NotesPage = {
  nextCursor: NotesCursor | null;
  notes: NoteWithHabit[];
};

export const listNotesPage = async (
  supabase: TypedSupabaseClient,
  { before, limit, signal, userId }: ListNotesPageParams
): Promise<NotesPage> => {
  const query = supabase
    .from('notes')
    .select(
      `
      *,
      occurrences (
        habits (
          name,
          icon_path
        )
      )
    `
    )
    .eq('user_id', userId);

  const { data, error } = await (
    before
      ? query
          .lte('created_at', before.createdAt)
          .or(`created_at.lt."${before.createdAt}",id.lt.${before.id}`)
      : query
  )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)
    .abortSignal(signal);

  if (error) {
    throw new Error(error.message);
  }

  const notes = data.slice(0, limit).map((note) => {
    const habit = note.occurrences?.habits ?? null;
    const { occurrences: _occurrences, ...noteWithoutOccurrences } = note;

    return camelcaseKeys({
      ...noteWithoutOccurrences,
      habit: habit
        ? {
            iconPath: habit.icon_path,
            name: habit.name,
          }
        : null,
    });
  });

  const lastNote = notes.at(-1);

  return {
    notes,
    nextCursor:
      data.length > limit && lastNote
        ? { createdAt: lastNote.createdAt, id: lastNote.id }
        : null,
  };
};
