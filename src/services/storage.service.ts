import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from '@const';
import { supabaseClient } from '@helpers';
import type { UploadResult } from '@models';
import { StorageBuckets } from '@models';
import imageCompression from 'browser-image-compression';

export const uploadFile = async (
  bucket: StorageBuckets,
  path: string,
  file: File,
  cacheControl?: string
) => {
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      cacheControl,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.path;
};

export const deleteFile = async (bucket: StorageBuckets, path: string) => {
  const { error } = await supabaseClient.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export async function uploadImage(
  bucket: StorageBuckets,
  file: File,
  userId: string,
  metadata?: object
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
      metadata,
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
