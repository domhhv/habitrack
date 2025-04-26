import { supabaseClient } from '@helpers';
import type { Note, NotesUpdate, NotesInsert } from '@models';
import { deepSnakify, deepCamelize } from '@utils';

export const createNote = async (note: NotesInsert): Promise<Note> => {
  const { data, error } = await supabaseClient
    .from('notes')
    .insert(deepSnakify(note))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const listNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabaseClient.from('notes').select();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(deepCamelize);
};

export const updateNote = async (
  id: Note['id'],
  note: NotesUpdate
): Promise<Note> => {
  const { data, error } = await supabaseClient
    .from('notes')
    .update(deepSnakify(note))
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data[0]);
};

export const destroyNote = async (id: Note['id']) => {
  const { error } = await supabaseClient.from('notes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return Promise.resolve();
};
