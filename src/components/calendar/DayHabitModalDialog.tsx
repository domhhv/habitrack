import { useOccurrences, useHabits, useTraits } from '@context';
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
  const { habits } = useHabits();
  const user = useUser();
  const { addOccurrence, addingOccurrence } = useOccurrences();
  const [selectedHabitId, setSelectedHabitId] = React.useState('');
  const { traitsMap } = useTraits();

  if (!date || !open) {
    return null;
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    const occurrence = {
      day: date.toISOString().split('T')[0],
      timestamp: +date,
      habitId: +selectedHabitId,
      userId: user?.id as string,
      time: null, // TODO: Add time picker
    };
    await addOccurrence(occurrence);

    handleClose();
  };

  const handleClose = () => {
    setSelectedHabitId('');
    onClose();
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
          Add a habit entry for {format(date, 'iii, LLL d, y')}
        </ModalHeader>
        <ModalBody>
          <Select
            required
            label={hasHabits ? 'Habits' : 'No habits yet'}
            selectedKeys={[selectedHabitId]}
            description="Select from your habits"
            data-testid="habit-select"
          >
            {habits.map((habit) => (
              <SelectItem
                key={habit.id.toString()}
                onClick={() => {
                  setSelectedHabitId(habit.id.toString());
                }}
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
