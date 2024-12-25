import { supabaseClient } from '@helpers';
import { type Note, type NotesInsert } from '@models';
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
