import { addToast } from '@heroui/react';
import imageCompression from 'browser-image-compression';
import pluralize from 'pluralize';

import { MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@const';
import { supabaseClient } from '@helpers';
import type { UploadResult } from '@models';
import { StorageBuckets } from '@models';
import {
  isRejected,
  isFulfilled,
  isFailedUpload,
  getErrorMessage,
  isSuccessfulUpload,
} from '@utils';

export const getPublicUrl = (bucket: StorageBuckets, path?: string | null) => {
  const { data } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(path || 'default.png');

  return data.publicUrl;
};

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

export const listFiles = async (bucket: StorageBuckets, path: string) => {
  const { data, error } = await supabaseClient.storage.from(bucket).list(path);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const uploadFile = async (
  bucket: StorageBuckets,
  path: string,
  file: File
) => {
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file);

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
  folder?: string
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

  try {
    const path = await uploadFile(
      StorageBuckets.OCCURRENCE_PHOTOS,
      `${userId}/${folder ? `${folder}/` : ''}${Date.now()}-${compressedFile.name}`,
      compressedFile
    );

    return { path, status: 'success' };
  } catch (error) {
    return { error: getErrorMessage(error), status: 'error' };
  }
}

export const uploadImages = async (
  bucket: StorageBuckets,
  userId: string,
  files: File[],
  folder?: string
) => {
  const results = await Promise.allSettled(
    files.map((file) => {
      return uploadImage(bucket, file, userId, folder);
    })
  );

  const fulfilledUploadResults = results.filter(isFulfilled);
  const rejectedUploadResults = results.filter(isRejected);

  const rejectedUploadReasons = rejectedUploadResults.map((result) => {
    return result.reason;
  });

  const failedUploadErrors = fulfilledUploadResults
    .filter(isFailedUpload)
    .map(({ value }) => {
      return value.error;
    })
    .concat(rejectedUploadReasons);

  if (failedUploadErrors.length) {
    addToast({
      color: 'danger',
      description: `Error details: ${failedUploadErrors.join(', ')}`,
      title: `Failed to upload ${pluralize('photo', failedUploadErrors.length, true)}`,
    });
  }

  return fulfilledUploadResults.filter(isSuccessfulUpload).map(({ value }) => {
    return value.path;
  });
};
