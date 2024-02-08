import { supabaseClient } from '@utils';

export enum Collections {
  ACCOUNTS = 'accounts',
  HABITS = 'habits',
  CALENDAR_EVENTS = 'calendar_events',
  NOTES = 'notes',
}

export type PostEntity<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

export type PatchEntity<T> = Partial<Omit<T, 'id' | 'created_at' | 'user_id'>>;

export const fetch = (collection: Collections) =>
  supabaseClient.from(collection);

export const get = async <T extends object>(
  collection: Collections
): Promise<T> => {
  const request = fetch(collection).select('*');

  const { error, data } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data as T;
};

export const post = async <T extends object>(
  collection: Collections,
  body: PostEntity<T>
): Promise<T> => {
  const { error, data } = await fetch(collection).insert(body).select();

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0];
};

export const patch = async <T extends object>(
  collection: Collections,
  id: string | number,
  body: Partial<T>
): Promise<T> => {
  const { error, data } = await fetch(collection)
    .upsert({ id, ...body, updated_at: new Date() })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  console.log();

  return data?.[0];
};

export const destroy = async <T extends object>(
  collection: Collections,
  id: string | number
): Promise<T> => {
  const { error, data } = await fetch(collection)
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0];
};
