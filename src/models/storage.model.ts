import type { createSignedUrls } from '@services';
import type { AsyncReturnType } from 'type-fest';

export enum StorageBuckets {
  HABIT_ICONS = 'habit_icons',
  OCCURRENCE_PHOTOS = 'occurrence_photos',
}

export type SuccessfulUpload = {
  status: 'success';
  path: string;
};

export type FailedUpload = {
  status: 'error';
  error: string;
};

export type UploadResult = SuccessfulUpload | FailedUpload;

export type SignedUrls = AsyncReturnType<typeof createSignedUrls>;
