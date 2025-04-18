import type { ButtonProps, TimeInputValue } from '@heroui/react';
import {
  NumberInput,
  Button,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SelectSection,
  Textarea,
  TimeInput,
} from '@heroui/react';
import { useScreenWidth, useUser } from '@hooks';
import { parseAbsoluteToLocal, ZonedDateTime } from '@internationalized/date';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useHabitsStore, useNotesStore, useOccurrencesStore } from '@stores';
import { getHabitIconUrl } from '@utils';
import { format, isFuture, isToday, isYesterday } from 'date-fns';
import React, { type ChangeEventHandler } from 'react';
import { Link } from 'react-router';
import type { RequireAtLeastOne } from 'type-fest';

import OccurrencePhotosUploader from './OccurrencePhotosUploader';

type OccurrenceDialogProps = RequireAtLeastOne<
  {
    isOpen: boolean;
    onClose: () => void;
    newOccurrenceDate: Date | null;
    existingOccurrenceId: number | null;
  },
  'newOccurrenceDate' | 'existingOccurrenceId'
>;

const OccurrenceDialog = ({
  isOpen,
  onClose,
  newOccurrenceDate,
  existingOccurrenceId,
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
  const [repeat, setRepeat] = React.useState(1);
  const [selectedHabitId, setSelectedHabitId] = React.useState('');
  const [time, setTime] = React.useState<TimeInputValue | null>(null);
  const [isDateTimeInFuture, setIsDateTimeInFuture] = React.useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    React.useState(false);
  const [photoPaths, setPhotoPaths] = React.useState<string[] | null>(null);
  const { isDesktop, isMobile } = useScreenWidth();

  const habitsByTraitName = React.useMemo(() => {
    return Object.groupBy(habits, (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

  const occurrenceToUpdate = React.useMemo(() => {
    return occurrences.find((o) => {
      return o.id === existingOccurrenceId;
    });
  }, [existingOccurrenceId, occurrences]);

  const hasHabits = habits.length > 0;

  React.useEffect(() => {
    if (time) {
      return;
    }

    if (!newOccurrenceDate && !existingOccurrenceId) {
      return;
    }

    if (existingOccurrenceId) {
      const occurrence = occurrences.find((o) => {
        return o.id === existingOccurrenceId;
      });

      if (!occurrence) {
        return;
      }

      setSelectedHabitId(occurrence.habitId.toString());
      setNote(occurrence.notes[0]?.content || '');
      setTime(
        parseAbsoluteToLocal(new Date(occurrence.timestamp).toISOString())
      );
      setPhotoPaths(occurrence.photoPaths);

      return;
    }

    if (newOccurrenceDate) {
      const occurrenceDateTime = new Date();

      occurrenceDateTime.setFullYear(newOccurrenceDate.getFullYear());
      occurrenceDateTime.setMonth(newOccurrenceDate.getMonth());
      occurrenceDateTime.setDate(newOccurrenceDate.getDate());

      setTime(parseAbsoluteToLocal(occurrenceDateTime.toISOString()));
    }
  }, [newOccurrenceDate, existingOccurrenceId, occurrences, time]);

  React.useEffect(() => {
    if (!habits.length) {
      return;
    }

    if (newOccurrenceDate) {
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
    newOccurrenceDate,
    occurrenceToUpdate,
    note,
    selectedHabitId,
    time,
    updatingOccurrence,
    updatingNote,
    habits.length,
  ]);

  React.useEffect(() => {
    if (!time) {
      return;
    }

    if (newOccurrenceDate) {
      setIsDateTimeInFuture(
        isFuture(
          new Date(
            newOccurrenceDate.getFullYear(),
            newOccurrenceDate.getMonth(),
            newOccurrenceDate.getDate(),
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
  }, [newOccurrenceDate, occurrenceToUpdate, time]);

  const handleSubmit = async () => {
    if (
      !user ||
      !(newOccurrenceDate || occurrenceToUpdate) ||
      !hasHabits ||
      !selectedHabitId ||
      Number.isNaN(+selectedHabitId)
    ) {
      return null;
    }

    const occurrenceDateTime = newOccurrenceDate
      ? new Date(newOccurrenceDate)
      : time instanceof ZonedDateTime
        ? time.toDate()
        : new Date();

    if (time instanceof ZonedDateTime) {
      occurrenceDateTime.setHours(time.hour);
      occurrenceDateTime.setMinutes(time.minute);
    }

    if (existingOccurrenceId && occurrenceToUpdate) {
      await updateOccurrence(occurrenceToUpdate.id, {
        timestamp: +occurrenceDateTime,
        habitId: +selectedHabitId,
        userId: user?.id as string,
      });

      if (note) {
        const existingNote = occurrenceToUpdate.notes[0];

        if (existingNote) {
          await updateNote(existingNote.id, {
            content: note,
            occurrenceId: existingOccurrenceId,
          });
        } else {
          await addNote({
            content: note,
            occurrenceId: existingOccurrenceId,
            userId: user.id,
          });
        }
      }

      handleClose();

      return;
    }

    const addPromises = Array.from({ length: repeat || 1 }).map(async () => {
      const newOccurrence = await addOccurrence({
        timestamp: +occurrenceDateTime,
        habitId: +selectedHabitId,
        userId: user?.id as string,
        photoPaths,
      });

      if (note) {
        await addNote({
          content: note,
          occurrenceId: newOccurrence.id,
          userId: user.id,
        });
      }
    });

    await Promise.all(addPromises);

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
    if (!newOccurrenceDate && !existingOccurrenceId) {
      return 'today';
    }

    const dateToFormat =
      newOccurrenceDate ||
      new Date(
        occurrences.find((o) => {
          return o.id === existingOccurrenceId;
        })?.timestamp || ''
      );

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
      size={isMobile ? 'full' : 'md'}
    >
      <ModalContent className="overflow-y-auto">
        <ModalHeader>
          {existingOccurrenceId ? 'Edit' : 'Add'} habit entry for {formatDate()}
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
            {Object.keys(habitsByTraitName).map((traitName) => {
              return (
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
              );
            })}
          </Select>
          <Textarea
            onKeyDown={() => {
              return null;
            }}
            onValueChange={setNote}
            value={note}
            placeholder="Note"
            variant="faded"
            classNames={
              !isDesktop
                ? {
                    input: 'text-base',
                  }
                : undefined
            }
          />
          {!occurrenceToUpdate && (
            <NumberInput
              onValueChange={setRepeat}
              value={repeat}
              label="Repeat"
              variant="faded"
              minValue={0}
              classNames={
                !isDesktop
                  ? {
                      inputWrapper: 'py-2 px-4 h-16',
                      label: 'text-small',
                      input: 'text-base',
                    }
                  : undefined
              }
            />
          )}
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
              classNames={
                !isDesktop
                  ? {
                      inputWrapper: 'py-3 px-4 h-16',
                      label: 'text-small',
                      input: 'text-base',
                    }
                  : undefined
              }
            />
          </div>
          <OccurrencePhotosUploader
            photoPaths={photoPaths}
            onPhotoPathsChange={setPhotoPaths}
          />
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

export default React.memo(OccurrenceDialog);
