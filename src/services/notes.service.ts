import type { CalendarDate, CalendarDateTime } from '@internationalized/date';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Note, NotesUpdate, NotesInsert, NoteWithHabit } from '@models';
import { toSqlDate, supabaseClient } from '@utils';

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

export const listPeriodNotes = async (
  range: [CalendarDate | CalendarDateTime, CalendarDate | CalendarDateTime]
): Promise<Note[]> => {
  const { data, error } = await supabaseClient
    .from('notes')
    .select()
    .in('period_kind', ['day', 'week', 'month'])
    .gte('period_date', toSqlDate(range[0]))
    .lte('period_date', toSqlDate(range[1]));

  if (error) {
    throw new Error(error.message);
  }

  return camelcaseKeys(data);
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
