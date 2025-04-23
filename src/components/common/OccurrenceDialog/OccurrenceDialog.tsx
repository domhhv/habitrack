import type { ButtonProps, TimeInputValue } from '@heroui/react';
import {
  Modal,
  Button,
  Select,
  Textarea,
  ModalBody,
  TimeInput,
  SelectItem,
  ListboxItem,
  ModalFooter,
  ModalHeader,
  NumberInput,
  ModalContent,
  SelectSection,
} from '@heroui/react';
import { ZonedDateTime, parseAbsoluteToLocal } from '@internationalized/date';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { format, isToday, isFuture, isYesterday } from 'date-fns';
import React, { type ChangeEventHandler } from 'react';
import { Link } from 'react-router';
import type { RequireAtLeastOne } from 'type-fest';

import { handleAsyncAction } from '@helpers';
import { useUser, useTextField, useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import { uploadImages } from '@services';
import { useHabits, useNoteActions, useOccurrenceActions } from '@stores';
import { toEventLike, getHabitIconUrl } from '@utils';

import OccurrencePhotosUploader from './OccurrencePhotosUploader';

type OccurrenceDialogProps = RequireAtLeastOne<
  {
    existingOccurrence: Occurrence | null;
    isOpen: boolean;
    newOccurrenceDate: Date | null;
    onClose: () => void;
  },
  'newOccurrenceDate' | 'existingOccurrence'
>;

const OccurrenceDialog = ({
  existingOccurrence,
  isOpen,
  newOccurrenceDate,
  onClose,
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
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
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
        hasNoteChanged ||
        hasHabitChanged ||
        hasTimeChanged ||
        uploadedFiles.length > 0;

      setIsSubmitButtonDisabled(isSaving || !hasOccurrenceChanged);

      return;
    }
  }, [
    newOccurrenceDate,
    existingOccurrence,
    uploadedFiles.length,
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
        const photoPaths = uploadedFiles.length
          ? await uploadImages(
              StorageBuckets.OCCURRENCE_PHOTOS,
              user.id,
              uploadedFiles,
              selectedHabitId
            )
          : [];

        await updateOccurrence(existingOccurrence.id, {
          habitId: +selectedHabitId,
          photoPaths: (existingOccurrence.photoPaths || []).concat(photoPaths),
          timestamp: +occurrenceDateTime,
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
            content: newNote.content,
            id: newNote.id,
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

    const photoPaths = uploadedFiles.length
      ? await uploadImages(
          StorageBuckets.OCCURRENCE_PHOTOS,
          user.id,
          uploadedFiles,
          selectedHabitId
        )
      : null;

    const addPromises = Array.from({ length: repeat || 1 }).map(async () => {
      const newOccurrence = await addOccurrence({
        habitId: +selectedHabitId,
        photoPaths,
        timestamp: +occurrenceDateTime,
        userId: user?.id as string,
      });

      if (note) {
        const newNote = await addNote({
          content: note,
          occurrenceId: newOccurrence.id,
          userId: user.id,
        });

        updateOccurrenceNoteInState(newOccurrence.id, {
          content: newNote.content,
          id: newNote.id,
        });
      }
    });

    void handleAsyncAction(
      Promise.all(addPromises),
      'add_occurrence',
      setIsSaving
    ).then(handleClose);
  };

  const handleClose = async () => {
    setSelectedHabitId('');
    clearNote();
    setUploadedFiles([]);
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
    isDisabled: isSubmitButtonDisabled,
    isLoading: isSaving,
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onClose={handleClose}
      role="add-occurrence-modal"
      size={isMobile ? 'full' : 'md'}
    >
      <ModalContent className="overflow-y-auto">
        <ModalHeader>
          {existingOccurrence ? 'Edit' : 'Add'} habit entry for {formatDate()}
        </ModalHeader>
        <ModalBody>
          <Select
            variant="faded"
            data-testid="habit-select"
            disableSelectorIconRotation
            selectedKeys={[selectedHabitId]}
            selectorIcon={<ArrowsClockwise />}
            onChange={handleHabitSelectionChange}
            description="Select from your habits"
            label={
              hasHabits
                ? 'Habits'
                : 'No habits yet. Create a habit to get started.'
            }
          >
            {Object.keys(habitsByTraitName).map((traitName) => {
              return (
                <SelectSection showDivider key={traitName} title={traitName}>
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
            value={note}
            variant="faded"
            placeholder="Note"
            onChange={handleNoteChange}
            onKeyDown={() => {
              return null;
            }}
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
              minValue={1}
              value={repeat}
              label="Repeat"
              variant="faded"
              onValueChange={setRepeat}
              classNames={
                !isDesktop
                  ? {
                      input: 'text-base',
                      inputWrapper: 'py-2 px-4 h-16',
                      label: 'text-small',
                    }
                  : undefined
              }
            />
          )}
          <div className="flex w-full flex-col gap-y-2">
            <TimeInput
              label="Time"
              value={time}
              variant="faded"
              onChange={setTime}
              description={
                isDateTimeInFuture &&
                'You are logging a habit for the future. Are you a time traveler?'
              }
              classNames={
                !isDesktop
                  ? {
                      input: 'text-base',
                      inputWrapper: 'py-3 px-4 h-16',
                      label: 'text-small',
                    }
                  : undefined
              }
            />
          </div>
          <OccurrencePhotosUploader
            files={uploadedFiles}
            onFilesChange={setUploadedFiles}
            photoPaths={existingOccurrence?.photoPaths || null}
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
