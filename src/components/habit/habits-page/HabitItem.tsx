import { useHabits, useSnackbar } from '@context';
import { useTraits } from '@hooks';
import type { Habit } from '@models';
import { DeleteForever } from '@mui/icons-material';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import {
  Chip,
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

type HabitRowProps = {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
};

const HabitItem = ({ habit, onEdit, onDelete }: HabitRowProps) => {
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
          await updateFile(StorageBuckets.HABIT_ICONS, habitIconPath, iconFile);

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
        showSnackbar('Failed to upload icon', {
          variant: 'soft',
          color: 'danger',
        });
      }
    }
  };

  const isGoodHabit = traitsMap[habit.traitId]?.slug === 'good';

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
            />
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
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
                color={isGoodHabit ? 'success' : 'danger'}
                size="sm"
                variant="soft"
              >
                <Typography level="body-xs" sx={{ margin: 0 }}>
                  {isGoodHabit ? 'Good' : 'Bad'}
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