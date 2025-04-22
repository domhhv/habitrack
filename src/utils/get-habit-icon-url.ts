import { StorageBuckets } from '@models';

const getHabitIconUrl = (habitIconPath?: string | null) => {
  if (habitIconPath?.startsWith('http')) {
    return habitIconPath;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${
    StorageBuckets.HABIT_ICONS
  }/${habitIconPath || 'default.png'}`;
};

export default getHabitIconUrl;
