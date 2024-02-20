import { StorageBuckets } from '@services';

export const getHabitIconUrl = (path?: string) => {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${
    StorageBuckets.HABIT_ICONS
  }/${path || 'default.png'}`;
};
