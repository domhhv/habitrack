import { supabaseClient } from '@helpers';

export enum StorageBuckets {
  HABIT_ICONS = 'habit_icons',
}

export const uploadFile = async (
  bucket: StorageBuckets,
  path: string,
  file: File
) => {
  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteFile = async (bucket: StorageBuckets, path: string) => {
  const { error } = await supabaseClient.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
};
