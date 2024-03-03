import { createSignedUrl, StorageBuckets } from '@services';
import React from 'react';

const useHabitIconUrl = (habitIconPath: string | null) => {
  const [iconUrl, setIconUrl] = React.useState<string>('');

  React.useEffect(() => {
    const loadIcon = async () => {
      const { data } = await createSignedUrl(
        StorageBuckets.HABIT_ICONS,
        habitIconPath || 'public/default.png',
        60
      );
      setIconUrl(data?.signedUrl || '');
    };

    void loadIcon();
  }, [habitIconPath]);

  return iconUrl;
};

export default useHabitIconUrl;
