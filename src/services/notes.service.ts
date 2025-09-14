import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

import type { Note, NotesUpdate, NotesInsert } from '@models';
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

export const listPeriodNotes = async (range: [Date, Date]): Promise<Note[]> => {
  const { data, error } = await supabaseClient
    .from('notes')
    .select()
    .in('period_kind', ['day', 'week', 'month'])
    .gt('period_date', toSqlDate(range[0]))
    .lt('period_date', toSqlDate(range[1]));

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
