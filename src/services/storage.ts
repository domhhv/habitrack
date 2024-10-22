import { supabaseClient } from '@helpers';

export enum StorageBuckets {
  HABIT_ICONS = 'habit_icons',
}

export const uploadFile = async (
  bucket: StorageBuckets,
  path: string,
  file: File
) => {
  return supabaseClient.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
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
