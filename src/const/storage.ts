import { StorageBuckets } from '@models';

export const MAX_FILE_SIZE_MB = {
  [StorageBuckets.HABIT_ICONS]: 0.1,
  [StorageBuckets.OCCURRENCE_PHOTOS]: 5,
};

export const ALLOWED_IMAGE_TYPES = {
  [StorageBuckets.HABIT_ICONS]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
  ],
  [StorageBuckets.OCCURRENCE_PHOTOS]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
  ],
};
