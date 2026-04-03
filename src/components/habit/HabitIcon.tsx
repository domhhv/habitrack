import { Spinner, Tooltip } from '@heroui/react';
import React from 'react';

import { VisuallyHiddenInput } from '@components';
import { type Habit, StorageBuckets } from '@models';
import { deleteFile, getPublicUrl, uploadHabitIcon } from '@services';
import { useUser, useHabitActions } from '@stores';
import { handleAsyncAction } from '@utils';

type HabitIconCellProps = {
  habit: Habit;
};

const HabitIcon = ({ habit }: HabitIconCellProps) => {
  const { updateHabit } = useHabitActions();
  const user = useUser();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async ({
    target: { files },
  }) => {
    if (!user || !files) {
      return null;
    }

    const [icon] = files;

    const upload = async () => {
      const iconPath = await uploadHabitIcon(user.id, icon);

      if (habit.iconPath) {
        await deleteFile(StorageBuckets.HABIT_ICONS, habit.iconPath);
      }

      return updateHabit(habit.id, { iconPath });
    };

    void handleAsyncAction(upload(), 'upload_icon', setIsUploading);
  };

  return (
    <Tooltip closeDelay={0}>
      <Tooltip.Trigger>
        <label
          aria-disabled={!user?.id || isUploading}
          className="rounded-medium hover:bg-default-100 flex h-12 w-12 cursor-pointer items-center justify-center p-1 opacity-100"
        >
          {isUploading ? (
            <Spinner size="sm" />
          ) : (
            <img
              alt={habit.name}
              role="habit-icon"
              className="h-8 w-8"
              src={getPublicUrl(StorageBuckets.HABIT_ICONS, habit.iconPath)}
            />
          )}
          <VisuallyHiddenInput onChange={handleFileChange} />
        </label>
      </Tooltip.Trigger>
      <Tooltip.Content>Upload new icon</Tooltip.Content>
    </Tooltip>
  );
};

export default HabitIcon;
