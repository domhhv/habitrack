import { parseAbsoluteToLocal, ZonedDateTime } from '@internationalized/date';
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
  TimeInput,
} from '@nextui-org/react';
import type { TimeInputValue, Selection } from '@nextui-org/react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useHabitsStore, useNotesStore, useOccurrencesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
import { format, isToday, isYesterday } from 'date-fns';
import React, { type MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import type { RequireAtLeastOne } from 'type-fest';

type OccurrenceDialogProps = RequireAtLeastOne<
  {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    occurrenceId: number | null;
  },
  'date' | 'occurrenceId'
>;

const OccurrenceDialog = ({
  isOpen,
  onClose,
  date,
  occurrenceId,
}: OccurrenceDialogProps) => {
  const user = useUser();
  const { habits } = useHabitsStore();
  const { addNote, addingNote } = useNotesStore();
  const { occurrences, addOccurrence, addingOccurrence } =
    useOccurrencesStore();
  const [note, setNote] = React.useState('');
  const [selectedHabitId, setSelectedHabitId] = React.useState<
    Selection & { currentKey?: string }
  >(new Set<number>([]));
  const [time, setTime] = React.useState<TimeInputValue | null>(null);

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(habits, (habit) => habit.trait?.name || 'Unknown');
  }, [habits]);

  const hasHabits = habits.length > 0;

  React.useEffect(() => {
    if (!date && !occurrenceId) {
      setTime(parseAbsoluteToLocal(new Date().toISOString()));
      return;
    }

    if (occurrenceId) {
      const occurrence = occurrences.find((o) => o.id === occurrenceId);

      if (!occurrence) {
        return;
      }

      setSelectedHabitId(new Set([occurrence.habitId.toString()]));
      setNote(occurrence.notes[0]?.content || '');
      setTime(
        parseAbsoluteToLocal(new Date(occurrence.timestamp).toISOString())
      );

      return;
    }

    if (date) {
      const occurrenceDateTime = new Date();

      occurrenceDateTime.setFullYear(date.getFullYear());
      occurrenceDateTime.setMonth(date.getMonth());
      occurrenceDateTime.setDate(date.getDate());

      setTime(parseAbsoluteToLocal(occurrenceDateTime.toISOString()));
    }
  }, [date, occurrenceId, occurrences]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    if (!user || !date || !hasHabits || !selectedHabitId.currentKey) {
      return null;
    }

    const occurrenceDateTime = new Date(date);

    if (time instanceof ZonedDateTime) {
      occurrenceDateTime.setHours(time.hour);
      occurrenceDateTime.setMinutes(time.minute);
    }

    const newOccurrence = await addOccurrence({
      timestamp: +occurrenceDateTime,
      habitId: +selectedHabitId.currentKey,
      userId: user?.id as string,
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
    setTimeout(() => {
      setSelectedHabitId(new Set([]));
      setNote('');
    });
    onClose();
  };

  const formatDate = () => {
    const dateToFormat =
      date ||
      new Date(occurrences.find((o) => o.id === occurrenceId)?.timestamp || '');

    if (isToday(dateToFormat)) {
      return 'today';
    }

    if (isYesterday(dateToFormat)) {
      return 'yesterday';
    }

    return format(dateToFormat || '', 'iii, LLL d, y');
  };

  return (
    <Modal
      role="add-occurrence-modal"
      isOpen={isOpen}
      onClose={handleClose}
      isDismissable={false}
      placement="center"
      // onClick={(e) => e.stopPropagation()}
    >
      <ModalContent>
        <ModalHeader>
          {occurrenceId ? 'Edit' : 'Add'} habit entry for {formatDate()}
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
          <div className="flex w-full flex-col gap-y-2">
            <TimeInput
              label="Time"
              value={time}
              onChange={setTime}
              variant="faded"
              maxValue={parseAbsoluteToLocal(new Date().toISOString())}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            as={hasHabits ? Button : Link}
            type="submit"
            color="primary"
            isLoading={addingOccurrence || addingNote}
            onClick={hasHabits ? handleSubmit : undefined}
            isDisabled={hasHabits && !selectedHabitId.currentKey}
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

export default OccurrenceDialog;
