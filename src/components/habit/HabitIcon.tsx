import { Button, Tooltip } from '@heroui/react';
import React from 'react';

import { InfinityLoader, VisuallyHiddenInput } from '@components';
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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async ({
    target: { files },
  }) => {
    if (!user || !files || isUploading) {
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
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger>
        <Button
          variant="ghost"
          aria-label="Upload habit icon"
          isDisabled={!user?.id || isUploading}
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="rounded-medium hover:bg-default-100 flex h-12 w-12 cursor-pointer items-center justify-center p-1 opacity-100"
        >
          {isUploading ? (
            <InfinityLoader size={32} color="var(--accent)" />
          ) : (
            <img
              alt={habit.name}
              role="habit-icon"
              className="h-8 w-8"
              src={getPublicUrl(StorageBuckets.HABIT_ICONS, habit.iconPath)}
            />
          )}
        </Button>
        <VisuallyHiddenInput
          ref={fileInputRef}
          isDisabled={isUploading}
          onChange={handleFileChange}
        />
      </Tooltip.Trigger>
      <Tooltip.Content>Upload new icon</Tooltip.Content>
    </Tooltip>
  );
};

export default HabitIcon;
