import { useCalendarEvents, useHabits } from '@context';
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
import React, { FormEventHandler } from 'react';

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
  const { addCalendarEvent, addingCalendarEvent } = useCalendarEvents();
  const [selectedBadHabit, setSelectedBadHabit] = React.useState<number | null>(
    null
  );

  if (!date || !open) {
    return null;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const calendarEvent = {
      day: date.toISOString().split('T')[0],
      habit_id: selectedBadHabit as number,
      user_id: user?.id as string,
    };
    await addCalendarEvent(calendarEvent);

    handleClose();
  };

  const handleSelect = (_: null, newValue: string) => {
    setSelectedBadHabit(Number(newValue));
  };

  const handleClose = () => {
    setSelectedBadHabit(null);
    onClose();
  };

  const hasHabits = Object.keys(habits).length > 0;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 380 }}>
        <ModalClose />
        <DialogTitle>
          Add habits for {format(date, 'iii, LLL d, y')}
        </DialogTitle>
        <DialogContent>Select from the habits provided below</DialogContent>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel id="habit-select-label" htmlFor="habit-select">
              Select Habit
            </FormLabel>
            <Select
              required
              color={'neutral'}
              placeholder="Select Habit"
              value={hasHabits ? selectedBadHabit : 0}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={handleSelect}
              disabled={addingCalendarEvent}
              id="habit-select"
            >
              {!hasHabits && (
                <Option value={0} label="No habits found" disabled>
                  No habits found
                </Option>
              )}
              {Object.values(habits).map((habit) => (
                <Option key={habit.id} value={habit.id} label={habit.name}>
                  {habit.name}
                  <Typography level="body-xs">{habit.trait}</Typography>
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
              loading={addingCalendarEvent}
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
