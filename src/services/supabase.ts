import { supabaseClient } from '@helpers';

export enum Collections {
  ACCOUNTS = 'accounts',
  HABITS = 'habits',
  OCCURRENCES = 'occurrences',
  NOTES = 'notes',
  TRAITS = 'traits',
}

export type PostEntity<T extends object> = Omit<
  T,
  'id' | 'created_at' | 'updated_at'
>;

export type PatchEntity<T extends object> = Partial<
  Omit<T, 'id' | 'created_at' | 'user_id'>
>;

export const fetch = (collection: Collections) =>
  supabaseClient.from(collection);

export const get = async <T extends object>(
  collection: Collections
): Promise<T[]> => {
  const request = fetch(collection).select('*');

  const { error, data } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data as T[];
};

export const getInRange = async <T extends object>(
  collection: Collections,
  columnName: keyof T & string,
  range: [number, number]
): Promise<T[]> => {
  const request = fetch(collection)
    .select()
    .gt(columnName, range[0])
    .lt(columnName, range[1]);

  const { error, data } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data as T[];
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
  body: PatchEntity<T>
): Promise<T> => {
  const { error, data } = await fetch(collection)
    .upsert({ id, ...body, updated_at: new Date() })
    .select();

  if (error) {
    throw new Error(error.message);
  }

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
