import { StorageBuckets } from '@services';

import { getHabitIconUrl } from './getHabitIconUrl';

describe(getHabitIconUrl.name, () => {
  it('should return the default habit icon URL when no path is provided', () => {
    expect(getHabitIconUrl()).toBe(
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${StorageBuckets.HABIT_ICONS}/default.png`
    );
  });

  it('should return the habit icon URL when a path is provided', () => {
    expect(getHabitIconUrl('path')).toBe(
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${StorageBuckets.HABIT_ICONS}/path`
    );
  });
});
