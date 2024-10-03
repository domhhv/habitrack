import { supabaseClient } from '@helpers';

export enum StorageBuckets {
  HABIT_ICONS = 'habit_icons',
}
export const listFiles = async (bucket: StorageBuckets, path: string) => {
  return supabaseClient.storage.from(bucket).list(path, {
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

export const deleteFile = async (bucket: StorageBuckets, path: string) => {
  return supabaseClient.storage.from(bucket).remove([path]);
};

export const createSignedUrl = async (
  bucket: StorageBuckets,
  path: string,
  expiresIn: number
) => {
  return supabaseClient.storage.from(bucket).createSignedUrl(path, expiresIn);
};
