import { supabaseClient } from '@helpers';
import type { NotesUpdate, Note, NotesInsert } from '@models';
import { deepSnakify, deepCamelize } from '@utils';

export const createNote = async (body: NotesInsert): Promise<Note> => {
  const serverBody = deepSnakify(body);

  const { error, data } = await supabaseClient
    .from('notes')
    .insert(serverBody)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data);
};

export const listNotes = async (): Promise<Note[]> => {
  const { error, data } = await supabaseClient.from('notes').select();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(deepCamelize);
};

export const updateNote = async (
  id: number,
  note: NotesUpdate
): Promise<Note> => {
  const serverNote = deepSnakify({
    ...note,
    updatedAt: new Date().toISOString(),
  });

  const { error, data } = await supabaseClient
    .from('notes')
    .update(serverNote)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return deepCamelize(data[0]);
};

export const destroyNote = async (id: number) => {
  const { error } = await supabaseClient.from('notes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return Promise.resolve();
};
