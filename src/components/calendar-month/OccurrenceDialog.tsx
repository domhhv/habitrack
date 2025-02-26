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
} from '@heroui/react';
import type { TimeInputValue, ButtonProps } from '@heroui/react';
import { useUser } from '@hooks';
import { parseAbsoluteToLocal, ZonedDateTime } from '@internationalized/date';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useHabitsStore, useNotesStore, useOccurrencesStore } from '@stores';
import { getHabitIconUrl } from '@utils';
import { format, isFuture, isToday, isYesterday } from 'date-fns';
import React, { type ChangeEventHandler } from 'react';
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
  const { user } = useUser();
  const { habits } = useHabitsStore();
  const { addNote, addingNote, updateNote, updatingNote } = useNotesStore();
  const {
    occurrences,
    addOccurrence,
    addingOccurrence,
    updateOccurrence,
    updatingOccurrence,
  } = useOccurrencesStore();
  const [note, setNote] = React.useState('');
  const [selectedHabitId, setSelectedHabitId] = React.useState('');
  const [time, setTime] = React.useState<TimeInputValue | null>(null);
  const [isDateTimeInFuture, setIsDateTimeInFuture] = React.useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    React.useState(false);

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(habits, (habit) => habit.trait?.name || 'Unknown');
  }, [habits]);

  const occurrenceToUpdate = React.useMemo(() => {
    return occurrences.find((o) => o.id === occurrenceId);
  }, [occurrenceId, occurrences]);

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

      setSelectedHabitId(occurrence.habitId.toString());
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

  React.useEffect(() => {
    if (date) {
      setIsSubmitButtonDisabled(
        !selectedHabitId || Number.isNaN(+selectedHabitId)
      );

      return;
    }

    if (occurrenceToUpdate) {
      const hasTimeChanged =
        time instanceof ZonedDateTime &&
        +time.toDate() !== +new Date(occurrenceToUpdate.timestamp);
      const hasNoteChanged =
        note !== (occurrenceToUpdate.notes[0]?.content || '');
      const hasHabitChanged =
        selectedHabitId !== occurrenceToUpdate.habitId.toString();

      const hasOccurrenceChanged =
        hasNoteChanged || hasHabitChanged || hasTimeChanged;

      const isOccurrenceUpdating = updatingOccurrence || updatingNote;

      setIsSubmitButtonDisabled(isOccurrenceUpdating || !hasOccurrenceChanged);

      return;
    }
  }, [
    date,
    occurrenceToUpdate,
    note,
    selectedHabitId,
    time,
    updatingOccurrence,
    updatingNote,
  ]);

  React.useEffect(() => {
    if (!time) {
      return;
    }

    if (date) {
      setIsDateTimeInFuture(
        isFuture(
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.hour,
            time.minute
          )
        )
      );

      return;
    }

    if (occurrenceToUpdate) {
      const occurrenceToUpdateDate = new Date(occurrenceToUpdate.timestamp);

      setIsDateTimeInFuture(
        isFuture(
          new Date(
            occurrenceToUpdateDate.getFullYear(),
            occurrenceToUpdateDate.getMonth(),
            occurrenceToUpdateDate.getDate(),
            time?.hour || 0,
            time?.minute || 0
          )
        )
      );
    }
  }, [date, occurrenceToUpdate, time]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (
      !user ||
      !(date || occurrenceToUpdate) ||
      !hasHabits ||
      !selectedHabitId ||
      Number.isNaN(+selectedHabitId)
    ) {
      return null;
    }

    const occurrenceDateTime = date
      ? new Date(date)
      : time instanceof ZonedDateTime
        ? time.toDate()
        : new Date();

    if (time instanceof ZonedDateTime) {
      occurrenceDateTime.setHours(time.hour);
      occurrenceDateTime.setMinutes(time.minute);
    }

    if (occurrenceId && occurrenceToUpdate) {
      await updateOccurrence(occurrenceToUpdate.id, {
        timestamp: +occurrenceDateTime,
        habitId: +selectedHabitId,
        userId: user?.id as string,
      });

      if (note) {
        const existingNote = occurrenceToUpdate.notes[0];

        if (existingNote) {
          await updateNote(existingNote.id, { content: note, occurrenceId });
        } else {
          await addNote({
            content: note,
            occurrenceId,
            userId: user.id,
          });
        }
      }

      handleClose();
      return;
    }

    const newOccurrence = await addOccurrence({
      timestamp: +occurrenceDateTime,
      habitId: +selectedHabitId,
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
      setSelectedHabitId('');
      setNote('');
    });
    onClose();
  };

  const handleHabitSelectionChange: ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setSelectedHabitId(e.target.value);
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

  const submitButtonSharedProps: ButtonProps = {
    color: 'primary',
    isLoading:
      addingOccurrence || addingNote || updatingOccurrence || updatingNote,
    isDisabled: isSubmitButtonDisabled,
  };

  return (
    <Modal
      role="add-occurrence-modal"
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
    >
      <ModalContent>
        <ModalHeader>
          {occurrenceId ? 'Edit' : 'Add'} habit entry for {formatDate()}
        </ModalHeader>
        <ModalBody>
          <Select
            disableSelectorIconRotation
            variant="faded"
            selectedKeys={[selectedHabitId]}
            onChange={handleHabitSelectionChange}
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
              variant="faded"
              value={time}
              onChange={setTime}
              description={
                isDateTimeInFuture &&
                'You are logging a habit for the future. Are you a time traveler?'
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          {hasHabits ? (
            <Button {...submitButtonSharedProps} onPress={handleSubmit}>
              {occurrenceToUpdate ? 'Update' : 'Add'}
            </Button>
          ) : (
            <Button as={Link} to="/habits" {...submitButtonSharedProps}>
              Go to Habits
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OccurrenceDialog;
