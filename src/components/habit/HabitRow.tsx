import { type Habit, useSnackbar } from '@context';
import { DeleteForever } from '@mui/icons-material';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import {
  Chip,
  IconButton,
  ListItemDecorator,
  styled,
  Tooltip,
  Typography,
} from '@mui/joy';
import { patchHabit, StorageBuckets, updateFile, uploadFile } from '@services';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import {
  StyledEditIconButton,
  StyledHabitTitleWrapper,
  StyledListItemContent,
  StyleListItem,
} from './view-habit/styled';

const StyledHabitImage = styled('img')({
  width: 32,
  height: 32,
});

type HabitRowProps = {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
};

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: '1px',
});

const HabitRow = ({ habit, onEdit, onDelete }: HabitRowProps) => {
  const [habitIcon, setHabitIcon] = React.useState<File | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setHabitIcon(file);
    }
  };

  React.useEffect(() => {
    const uploadHabitIcon = async () => {
      let icon_path = habit.icon_path;

      if (habitIcon) {
        if (icon_path) {
          await updateFile(
            StorageBuckets.HABIT_ICONS,
            `habit-id-${habit.id}`,
            habitIcon
          );

          showSnackbar('Icon replaced!', {
            variant: 'soft',
            color: 'success',
          });
        } else {
          const { data } = await uploadFile(
            StorageBuckets.HABIT_ICONS,
            `habit-id-${habit.id}`,
            habitIcon
          );

          icon_path = data?.path || '';

          await patchHabit(habit.id, { ...habit, icon_path });

          showSnackbar('Icon uploaded!', {
            variant: 'soft',
            color: 'success',
          });
        }
      }
    };

    void uploadHabitIcon();
  }, [habitIcon, showSnackbar, habit]);

  return (
    <StyleListItem>
      <ListItemDecorator>
        <Tooltip title="Upload new icon">
          <StyledEditIconButton
            size="lg"
            variant="plain"
            color="primary"
            as="label"
          >
            <StyledHabitImage
              src={getHabitIconUrl(habit.icon_path)}
              alt={habit.name}
            />
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </StyledEditIconButton>
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
                color={habit.trait === 'good' ? 'success' : 'danger'}
                size="sm"
                variant="soft"
              >
                <Typography level="body-xs" sx={{ margin: 0 }}>
                  {habit.trait === 'good' ? 'Good' : 'Bad'}
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
            <IconButton color="danger" variant="soft" onClick={onDelete}>
              <DeleteForever />
            </IconButton>
          </Tooltip>
        </div>
      </StyledListItemContent>
    </StyleListItem>
  );
};

export default HabitRow;
