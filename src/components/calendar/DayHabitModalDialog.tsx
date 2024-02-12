import { TimeOfDay, useCalendarEvents, useHabits } from '@context';
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
  const { addCalendarEvent, addingCalendarEvent } = useCalendarEvents();
  const [selectedBadHabit, setSelectedBadHabit] = React.useState<number | null>(
    null
  );
  const [selectedTimeOfDay, setSelectedTimeOfDay] = React.useState<
    TimeOfDay | 0
  >(0);

  if (!date || !open) {
    return null;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const calendarEvent = {
      day: date.toISOString().split('T')[0],
      timestamp: +date,
      habit_id: selectedBadHabit as number,
      time_of_day: selectedTimeOfDay || null,
      user_id: user?.id as string,
    };
    await addCalendarEvent(calendarEvent);

    handleClose();
  };

  const handleHabitSelect = (
    _: React.SyntheticEvent | null,
    newValue: number | null
  ) => {
    setSelectedBadHabit(Number(newValue));
  };

  const handleTimeOfDaySelect = (
    _: React.SyntheticEvent | null,
    newValue: string | null
  ) => {
    setSelectedTimeOfDay(newValue as TimeOfDay | 0);
  };

  const handleClose = () => {
    setSelectedBadHabit(0);
    onClose();
  };

  const hasHabits = habits.length > 0;

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
              onChange={handleHabitSelect}
              disabled={addingCalendarEvent}
            >
              {!hasHabits && (
                <Option value={0} label="No habits found" disabled>
                  No habits found
                </Option>
              )}
              {hasHabits &&
                habits.map((habit) => (
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
          <Box mt={2} mb={2}>
            <FormControl>
              <FormLabel id="habit-select-label" htmlFor="habit-select">
                Pick time of day
              </FormLabel>
              <Select
                color="neutral"
                placeholder="Pick time of day"
                value={selectedTimeOfDay || 'indifferent'}
                onChange={handleTimeOfDaySelect}
                disabled={addingCalendarEvent || !hasHabits}
              >
                {!hasHabits && (
                  <Option value={1} label="No habits found" disabled>
                    No habits found
                  </Option>
                )}
                {hasHabits && (
                  <>
                    <Option value="indifferent" label="Indifferent">
                      Indifferent (default)
                    </Option>
                    <Option value={TimeOfDay.NIGHT} label="Night">
                      Night
                    </Option>
                    <Option value={TimeOfDay.MORNING} label="Morning">
                      Morning
                    </Option>
                    <Option value={TimeOfDay.AFTERNOON} label="Afternoon">
                      Afternoon
                    </Option>
                    <Option value={TimeOfDay.EVENING} label="Evening">
                      Evening
                    </Option>
                  </>
                )}
              </Select>
            </FormControl>
          </Box>
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
