import { VisuallyHiddenInput } from '@components';
import { addToast, Button, Tooltip } from '@heroui/react';
import { useUser } from '@hooks';
import { type Habit } from '@models';
import { useHabitActions } from '@stores';
import { getErrorMessage, getHabitIconUrl } from '@utils';
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

    setIsUploading(true);

    const [iconFile] = files;

    try {
      await updateHabit(habit.id, user.id, {}, iconFile);
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while uploading your icon',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    } finally {
      setIsUploading(false);
    }
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
