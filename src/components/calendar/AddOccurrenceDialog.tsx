import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListboxItem,
  Textarea,
  Select,
  SelectItem,
  SelectSection,
  type Selection,
} from '@nextui-org/react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useHabitsStore, useNotesStore, useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
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
  const [selectedHabitId, setSelectedHabitId] = React.useState<Selection>(
    new Set<number>([])
  );
  const [note, setNote] = React.useState('');
  const { addNote, addingNote } = useNotesStore();

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(habits, (habit) => habit.trait?.name || 'Unknown');
  }, [habits]);

  if (!date || !open) {
    return null;
  }

  const hasHabits = habits.length > 0;

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    if (!user || !hasHabits || !selectedHabitId) {
      return null;
    }

    const newOccurrence = await addOccurrence({
      day: date.toISOString().split('T')[0],
      timestamp: +date,
      habitId: +selectedHabitId,
      userId: user?.id as string,
      time: null, // TODO: Add time picker
    });

    if (note) {
      await addNote({
        content: note,
        occurrenceId: newOccurrence.id,
        userId: user.id,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedHabitId(new Set([]));
    setNote('');
    onClose();
  };

  return (
    <Modal
      role="add-occurrence-modal"
      isOpen={open}
      onClose={handleClose}
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader>
          Add habit entry for {format(date, 'iii, LLL d, y')}
        </ModalHeader>
        <ModalBody>
          <Select
            disableSelectorIconRotation
            variant="faded"
            selectedKeys={selectedHabitId}
            onSelectionChange={setSelectedHabitId}
            label={
              hasHabits
                ? 'Habits'
                : 'No habits yet. Create a habit to get started.'
            }
            description="Select from your habits"
            data-testid="habit-select"
            selectorIcon={<ArrowsClockwise />}
          >
            {Object.keys(habitsByTraitName).map((traitName) => (
              <SelectSection key={traitName} title={traitName} showDivider>
                {habitsByTraitName[traitName] ? (
                  habitsByTraitName[traitName].map((habit) => {
                    const iconUrl = getHabitIconUrl(habit.iconPath);

                    return (
                      <SelectItem key={habit.id} textValue={habit.name}>
                        <div className="flex items-center gap-2">
                          <img
                            src={iconUrl}
                            alt={habit.name}
                            role="habit-icon"
                            className="h-4 w-4"
                          />
                          <span>{habit.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })
                ) : (
                  <ListboxItem key="none">No habits</ListboxItem>
                )}
              </SelectSection>
            ))}
          </Select>
          <Textarea
            onValueChange={setNote}
            value={note}
            placeholder="Note"
            variant="faded"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            as={hasHabits ? Button : Link}
            type="submit"
            color="primary"
            isLoading={addingOccurrence || addingNote}
            onClick={hasHabits ? handleSubmit : undefined}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            to={hasHabits ? undefined : '/habits'}
          >
            {hasHabits ? 'Add' : 'Go to Habits'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOccurrenceDialog;
