import { supabaseClient } from '@helpers';
import type { NotesUpdate, Note, NotesInsert } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

export const createNote = async (body: NotesInsert): Promise<Note> => {
  const serverBody = transformClientEntity(body);

  const { error, data } = await supabaseClient
    .from('notes')
    .insert(serverBody)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntity(data);
};

export const listNotes = async (): Promise<Note[]> => {
  const { error, data } = await supabaseClient.from('notes').select();

  if (error) {
    throw new Error(error.message);
  }

  return transformServerEntities(data);
};

export const updateNote = async (
  id: number,
  note: NotesUpdate
): Promise<Note> => {
  const serverNote = transformClientEntity({
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

  return transformServerEntity(data[0]);
};

export const destroyNote = async (id: number) => {
  const { error } = await supabaseClient.from('notes').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return Promise.resolve();
};
