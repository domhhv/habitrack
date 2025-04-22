import { VisuallyHiddenInput } from '@components';
import { handleAsyncAction } from '@helpers';
import { Button, Tooltip } from '@heroui/react';
import { useUser } from '@hooks';
import { type Habit } from '@models';
import { uploadHabitIcon } from '@services';
import { useHabitActions } from '@stores';
import { getHabitIconUrl } from '@utils';
import React from 'react';

type HabitIconCellProps = {
  habit: Habit;
};

const HabitIconCell = ({ habit }: HabitIconCellProps) => {
  const { updateHabit } = useHabitActions();
  const { user } = useUser();
  const [isUploading, setIsUploading] = React.useState(false);
  const iconUrl = getHabitIconUrl(habit.iconPath);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async ({
    target: { files },
  }) => {
    if (!user || !files) {
      return null;
    }

    const [icon] = files;

    const upload = async () => {
      const iconPath = await uploadHabitIcon(user.id, icon, habit.iconPath);

      return updateHabit(habit.id, { iconPath });
    };

    void handleAsyncAction(upload(), 'upload_icon', setIsUploading);
  };

  return (
    <Tooltip content="Upload new icon">
      <Button
        isIconOnly
        isLoading={isUploading}
        size="lg"
        variant="light"
        as="label"
        className="mr-1 flex h-12 w-12 cursor-pointer p-1 opacity-100"
        isDisabled={!user?.id}
      >
        <img
          src={iconUrl}
          alt={habit.name}
          role="habit-icon"
          className="h-8 w-8"
        />
        <VisuallyHiddenInput onChange={handleFileChange} />
      </Button>
    </Tooltip>
  );
};

export default HabitIconCell;
