import { useHabits, useSnackbar, useTraits } from '@context';
import { useHabitTraitChipColor, useHabitIconUrl } from '@hooks';
import type { Habit } from '@models';
import { DeleteForever } from '@mui/icons-material';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import { IconButton, ListItemDecorator, Tooltip, Typography } from '@mui/joy';
import { StorageBuckets, updateFile, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

import { VisuallyHiddenInput } from '../styled';

import {
  StyledEditIconButton,
  StyledHabitTitleWrapper,
  StyledListItemContent,
  StyledHabitImage,
  StyledListItem,
  StyledImageIconButton,
  StyledHabitTraitColorIndicator,
  StyledHabitTraitChip,
} from './styled';

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
  const iconUrl = useHabitIconUrl(habit.iconPath);

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
            variant: 'soft',
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
            variant: 'soft',
            color: 'success',
          });
        }
      } catch (e) {
        showSnackbar((e as Error).message || 'Failed to upload icon', {
          variant: 'soft',
          color: 'danger',
        });
      }
    }
  };

  return (
    <StyledListItem>
      <ListItemDecorator>
        <Tooltip title="Upload new icon">
          <StyledImageIconButton
            size="lg"
            variant="plain"
            color="primary"
            as="label"
          >
            <StyledHabitImage
              src={iconUrl}
              alt={habit.name}
              role="habit-icon"
            />
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              role="habit-icon-input"
            />
          </StyledImageIconButton>
        </Tooltip>
      </ListItemDecorator>
      <StyledListItemContent>
        <div>
          <StyledHabitTitleWrapper>
            <Typography level="title-sm">{habit.name}</Typography>
            <StyledHabitTraitChip
              size="sm"
              variant="plain"
              role="habit-trait-chip"
            >
              <StyledHabitTraitColorIndicator
                sx={{
                  backgroundColor: traitChipColor,
                }}
              />
              <Typography level="body-xs">
                {traitsMap[habit.traitId]?.label || 'Unknown'}
              </Typography>
            </StyledHabitTraitChip>
          </StyledHabitTitleWrapper>
          {habit.description && (
            <Typography level="body-xs" textAlign="left">
              <i>{habit.description}</i>
            </Typography>
          )}
        </div>
        <div>
          <Tooltip title="Edit habit">
            <StyledEditIconButton
              size="sm"
              variant="soft"
              color="primary"
              onClick={onEdit}
              role="edit-habit-button"
              data-testid={`edit-habit-id-${habit.id}-button`}
            >
              <ModeRoundedIcon fontSize="small" />
            </StyledEditIconButton>
          </Tooltip>
          <Tooltip title="Delete habit">
            <IconButton
              size="sm"
              color="danger"
              variant="soft"
              onClick={onDelete}
              role="delete-habit-button"
              data-testid={`delete-habit-id-${habit.id}-button`}
            >
              <DeleteForever />
            </IconButton>
          </Tooltip>
        </div>
      </StyledListItemContent>
    </StyledListItem>
  );
};

export default HabitItem;
