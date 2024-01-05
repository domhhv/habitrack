import { createCalendarEvent } from '@actions';
import { CalendarEventsContext, HabitsContext } from '@context';
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
} from '@mui/joy';
import { format } from 'date-fns';
import React, { FormEventHandler } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  date: Date | null;
};

export default function DayHabitModalDialog({ open, onClose, date }: Props) {
  const { habits } = React.useContext(HabitsContext);
  const { setCalendarEvents } = React.useContext(CalendarEventsContext);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedBadHabit, setSelectedBadHabit] = React.useState<number>(0);

  if (!date || !open) {
    return null;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const newCalendarEvent = await createCalendarEvent(
        date,
        selectedBadHabit
      );
      setCalendarEvents((prevCalendarEvents) => [
        ...prevCalendarEvents,
        newCalendarEvent,
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
    onClose();
  };

  const handleSelect = (_: React.MouseEvent, newValue: string) => {
    setSelectedBadHabit(Number(newValue));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 380 }}>
        <ModalClose />
        <DialogTitle>
          Add habits for {format(date, 'iii, LLL d, y')}
        </DialogTitle>
        <DialogContent>Select from the habits provided below</DialogContent>
        <form onSubmit={handleSubmit}>
          <Select
            placeholder="Select Bad Habit"
            value={selectedBadHabit}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onChange={handleSelect}
            disabled={submitting}
          >
            {habits.map((habit) => (
              <Option key={habit.id} value={habit.id} label={habit.name}>
                {habit.name}
                <Typography level="body-xs">{habit.trait}</Typography>
              </Option>
            ))}
          </Select>
          <Box mt={1}>
            <Button fullWidth loading={submitting} type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
}
