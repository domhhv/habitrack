import { VisuallyHiddenInput } from '@components';
import { useHabits, useSnackbar, useTraits } from '@context';
import { useHabitTraitChipColor } from '@hooks';
import type { Habit } from '@models';
import { Button, Chip, Tooltip } from '@nextui-org/react';
import { PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { StorageBuckets, updateFile, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

export type HabitItemProps = {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
};

const HabitItem = ({ habit, onEdit, onDelete }: HabitItemProps) => {
  const user = useUser();
  const { showSnackbar } = useSnackbar();
  const { traitsMap } = useTraits();
  const { updateHabit } = useHabits();
  const traitChipColor = useHabitTraitChipColor(habit.traitId);
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
    <li className="flex items-center border-b-gray-300 pb-1.5 pt-2 dark:border-b-gray-600 [&:not(:last-of-type)]:border-b">
      <Tooltip content="Upload new icon">
        <Button
          isIconOnly
          size="lg"
          variant="light"
          as="label"
          className="mr-1 flex h-12 w-12 cursor-pointer p-1"
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
      <div className="flex w-full items-center justify-between">
        <div>
          <div className="mb-0.5 flex items-center">
            <p>{habit.name}</p>
            <Chip size="sm" variant="faded" className="ml-2 h-5 border-1">
              <div className="flex items-center gap-1">
                <span
                  className="mr-0.5 inline-block h-1 w-1 rounded-full"
                  role="habit-trait-chip-color-indicator"
                  style={{
                    backgroundColor: traitChipColor,
                  }}
                />
                <p role="habit-trait-chip-name">
                  {traitsMap[habit.traitId]?.label || 'Unknown'}
                </p>
              </div>
            </Chip>
          </div>
          {habit.description && (
            <p className="text-left text-sm">
              <i>{habit.description}</i>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Tooltip content="Edit habit">
            <Button
              isIconOnly
              size="sm"
              variant="solid"
              color="primary"
              onClick={onEdit}
              role="edit-habit-button"
              data-testid={`edit-habit-id-${habit.id}-button`}
            >
              <PencilSimple weight="bold" size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete habit">
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="solid"
              onClick={onDelete}
              role="delete-habit-button"
              data-testid={`delete-habit-id-${habit.id}-button`}
            >
              <TrashSimple weight="bold" size={16} />
            </Button>
          </Tooltip>
        </div>
      </div>
    </li>
  );
};

export default HabitItem;
