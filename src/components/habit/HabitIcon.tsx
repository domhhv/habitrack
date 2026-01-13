import { Button, Tooltip } from '@heroui/react';
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
  const { user } = useUser();
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
    <Tooltip closeDelay={0} content="Upload new icon">
      <Button
        size="lg"
        isIconOnly
        as="label"
        variant="light"
        isDisabled={!user?.id}
        isLoading={isUploading}
        className="flex h-12 w-12 cursor-pointer p-1 opacity-100"
      >
        <img
          alt={habit.name}
          role="habit-icon"
          className="h-8 w-8"
          src={getPublicUrl(StorageBuckets.HABIT_ICONS, habit.iconPath)}
        />
        <VisuallyHiddenInput onChange={handleFileChange} />
      </Button>
    </Tooltip>
  );
};

export default HabitIcon;
