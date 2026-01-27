import type { CalendarDate } from '@internationalized/date';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Tables } from '@db-types';
import type { Note, NotesUpdate, NotesInsert, NoteWithHabit } from '@models';
import { supabaseClient } from '@utils';

export const createNote = async (note: NotesInsert): Promise<Note> => {
  const { data, error } = await supabaseClient
    .from('notes')
    .insert(decamelizeKeys(note))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
};

export const listNotes = async ([rangeStart, rangeEnd]: [
  CalendarDate,
  CalendarDate,
]): Promise<Note[]> => {
  const startDateString = rangeStart.toString();
  const endDateString = rangeEnd.toString();

  const periodNotesPromise = supabaseClient
    .from('notes')
    .select()
    .in('period_kind', ['day', 'week', 'month'])
    .gte('period_date', startDateString)
    .lte('period_date', endDateString);

  const occurrenceNotesPromise = supabaseClient
    .from('notes')
    .select('*, occurrence:occurrences!inner(occurred_at)')
    .gte('occurrences.occurred_at', startDateString)
    .lte('occurrences.occurred_at', endDateString);

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

  for (const note of [...periodResult.data, ...occurrenceResult.data]) {
    notesMap.set(note.id, note);
  }

  return camelcaseKeys([...notesMap.values()], { deep: true });
};

export const updateNote = async (
  id: Note['id'],
  note: NotesUpdate
): Promise<Note> => {
  const { data, error } = await supabaseClient
    .from('notes')
    .update(decamelizeKeys(note))
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data[0]);
};

export const destroyNote = async (id: Note['id']) => {
  const { error } = await supabaseClient.from('notes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export type ListAllNotesParams = {
  limit: number;
  page: number;
};

export const listAllNotes = async ({
  limit,
  page,
}: ListAllNotesParams): Promise<NoteWithHabit[]> => {
  const offset = page * limit;

  const { data, error } = await supabaseClient
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
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((note) => {
    const habit = note.occurrences?.habits ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { occurrences, ...noteWithoutOccurrences } = note;

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
};
