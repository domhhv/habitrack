import React from 'react';

import { useUser } from '@hooks';
import type { Habit } from '@models';
import { StorageBuckets } from '@models';
import { listFiles, deleteFile } from '@services';
import { useHabitActions } from '@stores';
import { handleAsyncAction } from '@utils';

const useHabitRemoval = () => {
  const { user } = useUser();
  const { removeHabit } = useHabitActions();
  const [habitToRemove, setHabitToRemove] = React.useState<Habit | null>(null);
  const [isRemoving, setIsRemoving] = React.useState<boolean>(false);

  const handleRemovalStart = (habit: Habit) => {
    setHabitToRemove(habit);
  };

  const handleRemovalConfirmed = async () => {
    if (!habitToRemove || !user) {
      return null;
    }

    const remove = async () => {
      const habitOccurrencePhotos = await listFiles(
        StorageBuckets.OCCURRENCE_PHOTOS,
        `${user.id}/${habitToRemove.id}/`
      );

      if (habitOccurrencePhotos.length > 0) {
        await Promise.all(
          habitOccurrencePhotos.map((photo) => {
            return deleteFile(
              StorageBuckets.OCCURRENCE_PHOTOS,
              `${user.id}/${habitToRemove.id}/${photo.name}`
            );
          })
        );
      }

      return removeHabit(habitToRemove);
    };

    void handleAsyncAction(remove(), 'remove_habit', setIsRemoving).then(
      handleRemovalEnd
    );
  };

  const handleRemovalEnd = () => {
    setHabitToRemove(null);
  };

  return {
    habitToRemove,
    handleRemovalConfirmed,
    handleRemovalEnd,
    handleRemovalStart,
    isRemoving,
  };
};

export default useHabitRemoval;
