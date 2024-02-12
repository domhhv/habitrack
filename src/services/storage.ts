import { supabaseClient } from '@helpers';

export enum StorageBuckets {
  HABIT_ICONS = 'habit-icons',
}

export const listFiles = async (bucket: StorageBuckets, userId: string) => {
  return supabaseClient.storage.from(bucket).list(userId, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
};

export const uploadFile = async (
  bucket: StorageBuckets,
  path: string,
  file: File
) => {
  return supabaseClient.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
};

export const updateFile = async (
  bucket: StorageBuckets,
  path: string,
  file: File
) => {
  return supabaseClient.storage
    .from(bucket)
    .update(path, file, { cacheControl: '3600', upsert: true });
};
