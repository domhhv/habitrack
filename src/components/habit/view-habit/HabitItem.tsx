import { Habit, useHabits, useSnackbar, useUser } from '@context';
import { DeleteForever } from '@mui/icons-material';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import {
  Chip,
  CircularProgress,
  IconButton,
  ListItemDecorator,
  Tooltip,
  Typography,
} from '@mui/joy';
import { habitService } from '@services';
import React from 'react';

import {
  StyledEditIconButton,
  StyledHabitTitleWrapper,
  StyledListItemContent,
  StyleListItem,
} from './styled';

type HabitItemProps = {
  habit: Habit;
  onEdit: () => void;
};

const HabitItem = ({ habit, onEdit }: HabitItemProps) => {
  const { user } = useUser();
  const [isBeingDeleted, setIsBeingDeleted] = React.useState(false);
  const habitsContext = useHabits();
  const { showSnackbar } = useSnackbar();

  const handleDeleteHabit = async () => {
    setIsBeingDeleted(true);

    try {
      await habitService.destroyHabit(habit.id, user);
      habitsContext.removeHabit(habit.id);
      showSnackbar('Your habit has been deleted!', {
        dismissible: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsBeingDeleted(false);
    }
  };

  return (
    <StyleListItem>
      <ListItemDecorator>
        <Tooltip title="Edit habit">
          <StyledEditIconButton
            size="sm"
            variant="soft"
            color="primary"
            disabled={isBeingDeleted}
            onClick={onEdit}
          >
            <ModeRoundedIcon fontSize="small" />
          </StyledEditIconButton>
        </Tooltip>
      </ListItemDecorator>
      <StyledListItemContent>
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
          <Typography level="body-xs" sx={{ margin: 0 }}>
            {habit.description || 'None'}
          </Typography>
        </div>
        {!isBeingDeleted ? (
          <Tooltip title="Delete this habit. This action cannot be undone!">
            <IconButton
              color="danger"
              variant="outlined"
              onClick={handleDeleteHabit}
            >
              <DeleteForever />
            </IconButton>
          </Tooltip>
        ) : (
          <CircularProgress size="sm" />
        )}
      </StyledListItemContent>
    </StyleListItem>
  );
};

export default HabitItem;
