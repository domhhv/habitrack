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
  'id' | 'createdAt' | 'updatedAt'
>;

export type PatchEntity<T extends object> = Partial<
  Omit<T, 'id' | 'createdAt' | 'userId'>
>;

export const fetch = (collection: Collections) =>
  supabaseClient.from(collection);

export const get = async <T extends object>(
  collection: Collections,
  columnName?: keyof T & string
): Promise<T[]> => {
  const { error, data } = await fetch(collection).select(columnName || '*');

  if (error) {
    throw new Error(error.message);
  }

  return data as T[];
};

export const getByField = async <T extends object>(
  collection: Collections,
  columnName: keyof T & string,
  value: string | number
): Promise<T[]> => {
  const { error, data } = await fetch(collection)
    .select()
    .eq(columnName, value);

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
  const { error, data } = await fetch(collection)
    .select()
    .gt(columnName, range[0])
    .lt(columnName, range[1]);

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
