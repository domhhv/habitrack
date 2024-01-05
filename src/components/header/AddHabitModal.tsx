import { createHabit } from '@actions';
import { FloatingLabelInput, FloatingLabelTextarea } from '@components';
import { HabitsContext } from '@context';
import { Add, CheckCircleOutline, WarningAmber } from '@mui/icons-material';
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
} from '@mui/joy';
import React, { FormEventHandler } from 'react';

export function AddHabitModal() {
  const [open, setOpen] = React.useState(false);
  const [habitName, setHabitName] = React.useState('');
  const [habitDescription, setHabitDescription] = React.useState('');
  const [habitTrait, setHabitTrait] = React.useState<'good' | 'bad' | ''>('');
  const [addingHabit, setAddingHabit] = React.useState(false);
  const { setHabits } = React.useContext(HabitsContext);

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleAdd: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setAddingHabit(true);

    try {
      const newHabit = await createHabit(
        habitName,
        habitDescription,
        habitTrait as 'good' | 'bad'
      );
      setHabitName('');
      setHabitDescription('');
      setHabitTrait('');
      setHabits((prevHabits) => [...prevHabits, newHabit]);
    } catch (error) {
      console.error(error);
    } finally {
      setAddingHabit(false);
      setOpen(false);
    }
  };

  const handleHabitNameChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setHabitName(event.target.value);
  };

  const handleHabitDescriptionChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    setHabitDescription(event.target.value);
  };

  const handleHabitTraitChange = (_: null, newValue: string) => {
    setHabitTrait(newValue as 'good' | 'bad');
  };

  return (
    <>
      <Button
        color="neutral"
        variant="soft"
        startDecorator={<Add />}
        onClick={handleDialogOpen}
      >
        Add habit
      </Button>
      <Modal open={open} onClose={handleDialogClose}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogContent>
            <form onSubmit={handleAdd}>
              <Box mb={1}>
                <FloatingLabelInput
                  required
                  value={habitName}
                  onChange={handleHabitNameChange}
                  label="Name"
                  placeholder="Enter habit name"
                />
              </Box>
              <Box mb={1}>
                <FloatingLabelTextarea
                  required
                  value={habitDescription}
                  onChange={handleHabitDescriptionChange}
                  label="Description"
                  placeholder="Enter habit description"
                />
              </Box>
              <Box mb={1}>
                <Select
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  onChange={handleHabitTraitChange}
                  required
                  placeholder="Choose a trait"
                  value={habitTrait}
                  endDecorator={
                    <>
                      {habitTrait === 'good' ? (
                        <CheckCircleOutline color="success" fontSize="small" />
                      ) : habitTrait === 'bad' ? (
                        <WarningAmber color="warning" fontSize="small" />
                      ) : null}
                    </>
                  }
                >
                  <Option value="good">Good</Option>
                  <Option value="bad">Bad</Option>
                </Select>
              </Box>
              <Box mt={1}>
                <Button fullWidth loading={addingHabit} type="submit">
                  Submit
                </Button>
              </Box>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}
