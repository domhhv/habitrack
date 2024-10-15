import { useOccurrences, useHabits, useTraits, useSnackbar } from '@context';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React, { type MouseEventHandler } from 'react';

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
  const { showSnackbar } = useSnackbar();
  const { habits } = useHabits();
  const user = useUser();
  const { addOccurrence, addingOccurrence } = useOccurrences();
  const [selectedHabitIds, setSelectedHabitIds] = React.useState<string[]>([]);
  const { traitsMap } = useTraits();

  if (!date || !open) {
    return null;
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    const addOccurrences = selectedHabitIds.map((id) => {
      return addOccurrence({
        day: date.toISOString().split('T')[0],
        timestamp: +date,
        habitId: +id,
        userId: user?.id as string,
        time: null, // TODO: Add time picker
      });
    });

    await Promise.all(addOccurrences);

    showSnackbar('Habit entries are added to the calendar', {
      color: 'success',
      dismissible: true,
      dismissText: 'Done',
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedHabitIds([]);
    onClose();
  };

  const handleHabitSelect = (habitId: string) => {
    if (selectedHabitIds.includes(habitId)) {
      setSelectedHabitIds(selectedHabitIds.filter((id) => id !== habitId));
    } else {
      setSelectedHabitIds([...selectedHabitIds, habitId]);
    }
  };

  const hasHabits = habits.length > 0;

  return (
    <Modal
      role="add-occurrence-modal"
      isOpen={open}
      onClose={handleClose}
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader>
          Add habit entries for {format(date, 'iii, LLL d, y')}
        </ModalHeader>
        <ModalBody>
          <Select
            selectionMode="multiple"
            label={hasHabits ? 'Habits' : 'No habits yet'}
            selectedKeys={selectedHabitIds}
            description="Select from your habits"
            data-testid="habit-select"
          >
            {habits.map((habit) => (
              <SelectItem
                key={habit.id.toString()}
                onClick={() => handleHabitSelect(habit.id.toString())}
                textValue={habit.name}
              >
                <span>{habit.name}</span>
                <span className="font-regular ml-2 text-neutral-400">
                  {traitsMap[habit.traitId]?.name}
                </span>
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            color="primary"
            isLoading={addingOccurrence}
            isDisabled={!hasHabits}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DayHabitModalDialog;
