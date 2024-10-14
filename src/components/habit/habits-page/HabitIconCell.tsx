import { VisuallyHiddenInput } from '@components';
import { useHabits, useSnackbar } from '@context';
import { type Habit } from '@models';
import { Button, Tooltip } from '@nextui-org/react';
import { StorageBuckets, updateFile, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

type HabitIconCellProps = {
  habit: Habit;
};

const HabitIconCell = ({ habit }: HabitIconCellProps) => {
  const { showSnackbar } = useSnackbar();
  const { updateHabit } = useHabits();
  const user = useUser();
  const iconUrl = getHabitIconUrl(habit.iconPath);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const iconFile = event.target.files?.[0];
    if (iconFile) {
      const existingIconPath = habit.iconPath;

      try {
        const split = iconFile.name.split('.');
        const extension = split[split.length - 1];
        const iconPath = `${user?.id}/habit-id-${habit.id}.${extension}`;

        if (existingIconPath) {
          const { error } = await updateFile(
            StorageBuckets.HABIT_ICONS,
            iconPath,
            iconFile
          );

          if (error) {
            throw error;
          }

          await updateHabit(habit.id, { ...habit, iconPath });

          showSnackbar('Icon replaced!', {
            color: 'success',
          });
        } else {
          const { data, error } = await uploadFile(
            StorageBuckets.HABIT_ICONS,
            iconPath,
            iconFile
          );

          if (error) {
            throw error;
          }

          await updateHabit(habit.id, { ...habit, iconPath: data.path });

          showSnackbar('Icon uploaded!', {
            color: 'success',
          });
        }
      } catch (e) {
        showSnackbar((e as Error).message || 'Failed to upload icon', {
          color: 'danger',
        });
      }
    }
  };

  return (
    <Tooltip content="Upload new icon">
      <Button
        isIconOnly
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
