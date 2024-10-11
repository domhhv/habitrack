import { StorageBuckets } from '@services';

export const getHabitIconUrl = (habitIconPath: string | null) => {
  if (habitIconPath?.startsWith('./')) {
    return habitIconPath;
  }

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${
    StorageBuckets.HABIT_ICONS
  }/${habitIconPath || 'default.png'}`;
};
