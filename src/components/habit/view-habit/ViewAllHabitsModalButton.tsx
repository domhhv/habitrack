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

import EditHabitDialog from '../edit-habit/EditHabitDialog';

import HabitItem from './HabitItem';
import { StyledPlaceholderContainer } from './styled';

type ViewAllHabitsModalButtonProps = {
  loading?: boolean;
};

const ViewAllHabitsModalButton = ({
  loading = false,
}: ViewAllHabitsModalButtonProps) => {
  const { habits } = useHabits();
  const [open, setOpen] = React.useState(false);
  const [isEditingHabit, setIsEditingHabit] = React.useState(false);
  const [habitIdToEdit, setHabitIdToEdit] = React.useState<number | null>(null);

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
    setHabitIdToEdit(null);
  };

  return (
    <>
      <Button
        color="neutral"
        variant="plain"
        disabled={loading}
        onClick={handleOpen}
        startDecorator={
          loading ? (
            <CircularProgress size="sm" variant="soft" color="neutral" />
          ) : (
            <ViewListRoundedIcon />
          )
        }
      >
        {loading ? 'Fetching habits...' : 'View All Habits'}
      </Button>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>View All Habits</DialogTitle>
          <DialogContent>
            {!habits.length && (
              <StyledPlaceholderContainer>
                <ViewListRoundedIcon sx={{ fontSize: 50 }} />
                <p>You have no habits yet.</p>
              </StyledPlaceholderContainer>
            )}
            {!!habits.length && (
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
                  habit={habits.find((h) => h.id === habitIdToEdit)}
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
