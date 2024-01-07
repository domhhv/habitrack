import { HabitsContext } from '@context';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  List,
  Modal,
  ModalClose,
  ModalDialog,
  styled,
} from '@mui/joy';
import React from 'react';

import HabitItem from './HabitItem';

const StyledPlaceholderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 200,
  width: 300,
  margin: `${theme.spacing(1)} auto 0`,
}));

export default function ViewAllHabitsModal() {
  const { habits } = React.useContext(HabitsContext);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        color="neutral"
        variant="soft"
        onClick={handleOpen}
        startDecorator={<ViewListRoundedIcon />}
      >
        View All Habits
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
              <List>
                {habits.map((habit) => (
                  <HabitItem key={habit.id} habit={habit} />
                ))}
              </List>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}
