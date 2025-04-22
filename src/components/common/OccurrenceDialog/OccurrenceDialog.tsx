import { handleAsyncAction } from '@helpers';
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
import { useScreenWidth, useTextField, useUser } from '@hooks';
import { parseAbsoluteToLocal, ZonedDateTime } from '@internationalized/date';
import type { Occurrence } from '@models';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useHabits, useNoteActions, useOccurrenceActions } from '@stores';
import { getHabitIconUrl, toEventLike } from '@utils';
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
    existingOccurrence: Occurrence | null;
  },
  'newOccurrenceDate' | 'existingOccurrence'
>;

const OccurrenceDialog = ({
  isOpen,
  onClose,
  newOccurrenceDate,
  existingOccurrence,
}: OccurrenceDialogProps) => {
  const { user } = useUser();
  const habits = useHabits();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote, updateNote } = useNoteActions();
  const { addOccurrence, updateOccurrence, updateOccurrenceNoteInState } =
    useOccurrenceActions();
  const [note, handleNoteChange, clearNote] = useTextField();
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

  const hasHabits = habits.length > 0;

  React.useEffect(() => {
    if (!newOccurrenceDate && !existingOccurrence) {
      return;
    }

    if (isOpen && existingOccurrence) {
      setSelectedHabitId(existingOccurrence.habitId.toString());
      handleNoteChange(toEventLike(existingOccurrence.notes[0]?.content || ''));
      setTime(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parseAbsoluteToLocal(
          new Date(existingOccurrence.timestamp).toISOString()
        )
      );
      setPhotoPaths(existingOccurrence.photoPaths);

      return;
    }

    if (isOpen && newOccurrenceDate) {
      const occurrenceDateTime = new Date();

      occurrenceDateTime.setFullYear(newOccurrenceDate.getFullYear());
      occurrenceDateTime.setMonth(newOccurrenceDate.getMonth());
      occurrenceDateTime.setDate(newOccurrenceDate.getDate());

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setTime(parseAbsoluteToLocal(occurrenceDateTime.toISOString()));
    }
  }, [newOccurrenceDate, existingOccurrence, isOpen, handleNoteChange]);

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

    if (existingOccurrence) {
      const hasTimeChanged =
        time instanceof ZonedDateTime &&
        +time.toDate() !== +new Date(existingOccurrence.timestamp);
      const hasNoteChanged =
        note !== (existingOccurrence.notes[0]?.content || '');
      const hasHabitChanged =
        selectedHabitId !== existingOccurrence.habitId.toString();

      const hasOccurrenceChanged =
        hasNoteChanged || hasHabitChanged || hasTimeChanged;

      setIsSubmitButtonDisabled(isSaving || !hasOccurrenceChanged);

      return;
    }
  }, [
    newOccurrenceDate,
    existingOccurrence,
    note,
    selectedHabitId,
    time,
    isSaving,
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

    if (existingOccurrence) {
      const existingOccurrenceDate = new Date(existingOccurrence.timestamp);

      setIsDateTimeInFuture(
        isFuture(
          new Date(
            existingOccurrenceDate.getFullYear(),
            existingOccurrenceDate.getMonth(),
            existingOccurrenceDate.getDate(),
            time?.hour || 0,
            time?.minute || 0
          )
        )
      );
    }
  }, [newOccurrenceDate, existingOccurrence, time]);

  const handleSubmit = async () => {
    if (
      !user ||
      !(newOccurrenceDate || existingOccurrence) ||
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

    setIsSaving(true);

    if (existingOccurrence) {
      const updatePromise = async () => {
        await updateOccurrence(existingOccurrence.id, {
          timestamp: +occurrenceDateTime,
          habitId: +selectedHabitId,
          userId: user?.id as string,
        });

        if (note) {
          const [existingNote] = existingOccurrence.notes;

          let newNote;

          if (existingNote) {
            newNote = await updateNote(existingNote.id, {
              content: note,
              occurrenceId: existingOccurrence.id,
            });
          } else {
            newNote = await addNote({
              content: note,
              occurrenceId: existingOccurrence.id,
              userId: user.id,
            });
          }

          updateOccurrenceNoteInState(existingOccurrence.id, {
            id: newNote.id,
            content: newNote.content,
          });
        }
      };

      void handleAsyncAction(
        updatePromise(),
        'update_occurrence',
        setIsSaving
      ).then(handleClose);

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
        const newNote = await addNote({
          content: note,
          occurrenceId: newOccurrence.id,
          userId: user.id,
        });

        updateOccurrenceNoteInState(newOccurrence.id, {
          id: newNote.id,
          content: newNote.content,
        });
      }
    });

    void handleAsyncAction(
      Promise.all(addPromises),
      'add_occurrence',
      setIsSaving
    ).then(handleClose);
  };

  const handleClose = () => {
    setSelectedHabitId('');
    clearNote();
    onClose();
  };

  const handleHabitSelectionChange: ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setSelectedHabitId(e.target.value);
  };

  const formatDate = () => {
    if (!newOccurrenceDate && !existingOccurrence) {
      return 'today';
    }

    const dateToFormat =
      newOccurrenceDate || new Date(existingOccurrence?.timestamp || '');

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
    isLoading: isSaving,
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
          {existingOccurrence ? 'Edit' : 'Add'} habit entry for {formatDate()}
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
            onChange={handleNoteChange}
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
          {!existingOccurrence && (
            <NumberInput
              onValueChange={setRepeat}
              value={repeat}
              label="Repeat"
              variant="faded"
              minValue={1}
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
              {existingOccurrence ? 'Update' : 'Add'}
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
