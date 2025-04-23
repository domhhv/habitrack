import type { AsyncReturnType } from 'type-fest';

import type { createSignedUrls } from '@services';

export enum StorageBuckets {
  HABIT_ICONS = 'habit_icons',
  OCCURRENCE_PHOTOS = 'occurrence_photos',
}

export type SuccessfulUpload = {
  path: string;
  status: 'success';
};

export type FailedUpload = {
  error: string;
  status: 'error';
};

export type UploadResult = SuccessfulUpload | FailedUpload;

export type SignedUrls = AsyncReturnType<typeof createSignedUrls>;
