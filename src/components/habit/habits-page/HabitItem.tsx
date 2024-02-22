import { useHabits, useSnackbar, useTraits } from '@context';
import type { Habit } from '@models';
import { DeleteForever } from '@mui/icons-material';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import {
  Chip,
  type ChipProps,
  IconButton,
  ListItemDecorator,
  Tooltip,
  Typography,
} from '@mui/joy';
import { StorageBuckets, updateFile, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import {
  StyledEditIconButton,
  StyledHabitTitleWrapper,
  StyledListItemContent,
  StyledHabitImage,
  StyledListItem,
  VisuallyHiddenInput,
  StyledImageIconButton,
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

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const iconFile = event.target.files?.[0];
    if (iconFile) {
      const existingIconPath = habit.iconPath;

      try {
        const split = iconFile.name.split('.');
        const extension = split[split.length - 1];
        const habitIconPath = `${user?.id}/habit-id-${habit.id}.${extension}`;

        if (existingIconPath) {
          const { error } = await updateFile(
            StorageBuckets.HABIT_ICONS,
            habitIconPath,
            iconFile
          );

          if (error) {
            throw error;
          }

          await updateHabit(habit.id, { ...habit, iconPath: habitIconPath });

          showSnackbar('Icon replaced!', {
            variant: 'soft',
            color: 'success',
          });
        } else {
          const { data, error } = await uploadFile(
            StorageBuckets.HABIT_ICONS,
            habitIconPath,
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

  const getHabitTraitChipColor = (): ChipProps['color'] => {
    const { slug } = traitsMap[habit.traitId] || {};

    if (slug === 'good') {
      return 'success';
    }

    if (slug === 'bad') {
      return 'danger';
    }

    return 'neutral';
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
              src={getHabitIconUrl(habit.iconPath)}
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
        <div style={{ display: 'flex' }}>
          <div>
            <StyledHabitTitleWrapper>
              <Typography level="title-sm" sx={{ margin: 0 }}>
                {habit.name}
              </Typography>
              <Chip
                color={getHabitTraitChipColor()}
                size="sm"
                variant="soft"
                role="habit-trait-chip"
              >
                <Typography level="body-xs" sx={{ margin: 0 }}>
                  {traitsMap[habit.traitId]?.name || 'Unknown'}
                </Typography>
              </Chip>
            </StyledHabitTitleWrapper>
            {habit.description && (
              <Typography level="body-xs" sx={{ margin: 0 }} textAlign="left">
                <i>{habit.description}</i>
              </Typography>
            )}
          </div>
        </div>
        <div>
          <Tooltip title="Edit habit">
            <StyledEditIconButton
              size="sm"
              variant="soft"
              color="primary"
              onClick={onEdit}
              role="edit-habit-button"
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
