import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from '@const';
import { supabaseClient } from '@helpers';
import imageCompression from 'browser-image-compression';
import type { AsyncReturnType } from 'type-fest';

export enum StorageBuckets {
  HABIT_ICONS = 'habit_icons',
  OCCURRENCE_PHOTOS = 'occurrence_photos',
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

  return true;
};

export type SuccessfulUpload = {
  status: 'success';
  path: string;
};

export type FailedUpload = {
  status: 'error';
  error: string;
};

export type UploadResult = SuccessfulUpload | FailedUpload;

export async function uploadImage(
  bucket: StorageBuckets,
  file: File,
  userId: string
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES[bucket].includes(file.type)) {
    return { error: 'Invalid file type', status: 'error' };
  }

  if (file.size > MAX_FILE_SIZE_MB[bucket] * 1024 * 1024) {
    return {
      error: `File size exceeds ${MAX_FILE_SIZE_MB[bucket]} MB limit`,
      status: 'error',
    };
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const filePath = `${userId}/${Date.now()}_${compressedFile.name}`;

  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, compressedFile, {
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, status: 'error' };
  }

  return { path: uploadData.path, status: 'success' };
}

export const createSignedUrls = async (
  filePaths: string[],
  expiresIn = 60 * 5
) => {
  const { data, error } = await supabaseClient.storage
    .from(StorageBuckets.OCCURRENCE_PHOTOS)
    .createSignedUrls(filePaths, expiresIn);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export type SignedUrls = AsyncReturnType<typeof createSignedUrls>;
