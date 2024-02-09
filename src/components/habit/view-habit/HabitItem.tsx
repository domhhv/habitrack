import { Habit, useCalendarEvents, useHabits } from '@context';
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
import React from 'react';

import {
  StyledEditIconButton,
  StyledHabitImage,
  StyledHabitTitleWrapper,
  StyledListItemContent,
  StyleListItem,
} from './styled';

type HabitItemProps = {
  habit: Habit;
  onEdit: () => void;
};

const HabitItem = ({ habit, onEdit }: HabitItemProps) => {
  const [isBeingDeleted, setIsBeingDeleted] = React.useState(false);
  const { removeHabit } = useHabits();
  const { removeCalendarEventsByHabitId } = useCalendarEvents();

  const handleDeleteHabit = async () => {
    setIsBeingDeleted(true);
    await removeHabit(habit.id);
    removeCalendarEventsByHabitId(habit.id);
    setIsBeingDeleted(false);
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
          {habit.description && (
            <Typography level="body-xs" sx={{ margin: 0 }}>
              {habit.description}
            </Typography>
          )}
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
      {habit.icon_path && (
        <StyledHabitImage
          src={`${process.env.SUPABASE_STORAGE_URL}/${habit.icon_path}`}
          alt={habit.name}
        />
      )}
    </StyleListItem>
  );
};

export default HabitItem;
