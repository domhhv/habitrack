import { useOccurrences, useHabits, useTraits } from '@context';
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Option,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/joy';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React, { type FormEventHandler } from 'react';

type DayHabitModalDialogProps = {
  open: boolean;
  onClose: () => void;
  date: Date | null;
};

const DayHabitModalDialog = ({
  open,
  onClose,
  date,
}: DayHabitModalDialogProps) => {
  const { habits } = useHabits();
  const user = useUser();
  const { addOccurrence, addingOccurrence } = useOccurrences();
  const [selectedHabitId, setSelectedHabitId] = React.useState<number | null>(
    null
  );
  const { traitsMap } = useTraits();

  if (!date || !open) {
    return null;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const occurrence = {
      day: date.toISOString().split('T')[0],
      timestamp: +date,
      habitId: selectedHabitId as number,
      userId: user?.id as string,
      time: null, // TODO: Add time picker
    };
    await addOccurrence(occurrence);

    handleClose();
  };

  const handleHabitSelect = (
    _: React.SyntheticEvent | null,
    newValue: number | null
  ) => {
    setSelectedHabitId(Number(newValue));
  };

  const handleClose = () => {
    setSelectedHabitId(0);
    onClose();
  };

  const hasHabits = habits.length > 0;

  return (
    <Modal role="add-occurrence-modal" open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 380 }}>
        <ModalClose role="add-occurrence-modal-close" />
        <DialogTitle>
          Add habits for {format(date, 'iii, LLL d, y')}
        </DialogTitle>
        <DialogContent>Select from the habits provided below</DialogContent>
        <form role="add-occurrence-form" onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel id="habit-select-label" htmlFor="habit-select">
              Select Habit
            </FormLabel>
            <Select
              required
              color={'neutral'}
              placeholder="Select Habit"
              value={hasHabits ? selectedHabitId : 0}
              onChange={handleHabitSelect}
              disabled={addingOccurrence}
              role="habit-select"
            >
              {!hasHabits && (
                <Option value={0} label="No habits found" disabled>
                  No habits found
                </Option>
              )}
              {hasHabits &&
                habits.map((habit) => (
                  <Option key={habit.id} value={habit.id} label={habit.name}>
                    <span>{habit.name}</span>
                    <Typography level="body-xs">
                      {traitsMap[habit.traitId]?.label}
                    </Typography>
                  </Option>
                ))}
            </Select>
            {!hasHabits && (
              <FormHelperText id="select-field-demo-helper">
                Add a habit or some first
              </FormHelperText>
            )}
          </FormControl>
          <Box mt={1}>
            <Button
              fullWidth
              loading={addingOccurrence}
              disabled={!hasHabits}
              type="submit"
            >
              Submit
            </Button>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default DayHabitModalDialog;
