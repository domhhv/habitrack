import { EditHabitDialog } from '@components';
import { useHabits } from '@context';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import {
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  List,
  Modal,
  ModalClose,
  ModalDialog,
} from '@mui/joy';
import React from 'react';

import HabitItem from './HabitItem';
import { StyledPlaceholderContainer } from './styled';

const ViewAllHabitsModalButton = () => {
  const { fetchingHabits, habits, habitsMap } = useHabits();
  const [open, setOpen] = React.useState(false);
  const [isEditingHabit, setIsEditingHabit] = React.useState(false);
  const [habitIdToEdit, setHabitIdToEdit] = React.useState<number>(0);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditStart = (habitId: number) => {
    setIsEditingHabit(true);
    setHabitIdToEdit(habitId);
  };

  const handleEditEnd = () => {
    setIsEditingHabit(false);
    setHabitIdToEdit(0);
  };

  const hasHabits = !!habits.length;

  return (
    <>
      <Button
        color="primary"
        variant="soft"
        disabled={fetchingHabits}
        onClick={handleOpen}
        startDecorator={
          fetchingHabits ? (
            <CircularProgress size="sm" variant="soft" color="neutral" />
          ) : (
            <ViewListRoundedIcon />
          )
        }
      >
        {fetchingHabits ? 'Fetching habits...' : 'View All Habits'}
      </Button>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>View All Habits</DialogTitle>
          <DialogContent>
            {!hasHabits && (
              <StyledPlaceholderContainer>
                <ViewListRoundedIcon sx={{ fontSize: 50 }} />
                <p>You have no habits yet.</p>
              </StyledPlaceholderContainer>
            )}
            {hasHabits && (
              <>
                <List>
                  {habits.map((habit) => (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      onEdit={() => handleEditStart(habit.id)}
                    />
                  ))}
                </List>
                <EditHabitDialog
                  open={isEditingHabit}
                  onClose={handleEditEnd}
                  habit={habitsMap[habitIdToEdit]}
                />
              </>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ViewAllHabitsModalButton;
