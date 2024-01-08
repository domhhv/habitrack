import { deleteHabit } from '@actions';
import { Habit, HabitsContext } from '@context';
import { DeleteForever } from '@mui/icons-material';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import {
  Chip,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  styled,
  Tooltip,
  Typography,
} from '@mui/joy';
import React from 'react';

const StyleListItem = styled(ListItem)(({ theme }) => ({
  alignItems: 'flex-start',
  padding: theme.spacing(1.5, 0, 1),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledEditIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const StyledListItemContent = styled(ListItemContent)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
});

const StyledHabitTitleWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > div': {
    marginLeft: theme.spacing(1),
  },
}));

type HabitItemProps = {
  habit: Habit;
  onEdit: () => void;
};

export default function HabitItem({ habit, onEdit }: HabitItemProps) {
  const [isBeingDeleted, setIsBeingDeleted] = React.useState(false);
  const { removeHabit } = React.useContext(HabitsContext);

  const handleDeleteHabit = async () => {
    setIsBeingDeleted(true);

    try {
      await deleteHabit(habit.id);
      removeHabit(habit.id);
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
}
