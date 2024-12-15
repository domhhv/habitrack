import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Listbox,
  ListboxSection,
  ListboxItem,
  ScrollShadow,
} from '@nextui-org/react';
import { useHabitsStore, useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React, { type MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

type AddOccurrenceDialogProps = {
  open: boolean;
  onClose: () => void;
  date: Date | null;
};

const AddOccurrenceDialog = ({
  open,
  onClose,
  date,
}: AddOccurrenceDialogProps) => {
  const { habits } = useHabitsStore();
  const user = useUser();
  const { addOccurrence, addingOccurrence } = useOccurrencesStore();
  const [selectedHabitIds, setSelectedHabitIds] = React.useState<string[]>([]);

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(habits, (habit) => habit.trait?.name || 'Unknown');
  }, [habits]);

  if (!date || !open) {
    return null;
  }

  const hasHabits = habits.length > 0;

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    if (!user || !hasHabits) {
      return null;
    }

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

  const renderSubmitButton = () => {
    if (hasHabits) {
      return (
        <Button
          type="submit"
          color="primary"
          isLoading={addingOccurrence}
          onClick={handleSubmit}
        >
          Add
        </Button>
      );
    }

    return (
      <Button as={Link} color="primary" to={'/habits'}>
        {hasHabits ? 'Add' : 'Go to Habits'}
      </Button>
    );
  };

  return (
    <Modal role="add-occurrence-modal" isOpen={open} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          Add habit entries for {format(date, 'iii, LLL d, y')}
        </ModalHeader>
        <ModalBody>
          <div className="rounded border border-neutral-200 px-1 dark:border-neutral-800">
            <ScrollShadow className="max-h-80" size={100}>
              <Listbox
                variant="flat"
                color="primary"
                selectionMode="multiple"
                selectedKeys={selectedHabitIds}
                disabledKeys={['none']}
                emptyContent="No habits yet. Create a habit to get started."
              >
                {Object.keys(habitsByTraitName).map((traitName) => (
                  <ListboxSection key={traitName} showDivider title={traitName}>
                    {habitsByTraitName[traitName] ? (
                      habitsByTraitName[traitName].map((habit) => (
                        <ListboxItem
                          key={habit.id.toString()}
                          onClick={() => handleHabitSelect(habit.id.toString())}
                        >
                          {habit.name}
                        </ListboxItem>
                      ))
                    ) : (
                      <ListboxItem key="none">No habits</ListboxItem>
                    )}
                  </ListboxSection>
                ))}
              </Listbox>
            </ScrollShadow>
          </div>
        </ModalBody>
        <ModalFooter>{renderSubmitButton()}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOccurrenceDialog;
