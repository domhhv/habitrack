import type { ButtonProps, TimeInputValue } from '@heroui/react';
import {
  Modal,
  Button,
  Select,
  Textarea,
  ModalBody,
  TimeInput,
  SelectItem,
  ModalFooter,
  ModalHeader,
  NumberInput,
  ModalContent,
  SelectSection,
} from '@heroui/react';
import type { CalendarDate, CalendarDateTime } from '@internationalized/date';
import {
  now,
  today,
  toZoned,
  isToday,
  isSameDay,
  ZonedDateTime,
  toCalendarDateTime,
  parseAbsoluteToLocal,
} from '@internationalized/date';
import { ArrowsClockwise } from '@phosphor-icons/react';
import groupBy from 'lodash.groupby';
import pluralize from 'pluralize';
import React, { type ChangeEventHandler } from 'react';
import { useDateFormatter } from 'react-aria';
import { Link } from 'react-router';
import type { RequireAtLeastOne } from 'type-fest';

import { useUser, useTextField, useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import {
  getPublicUrl,
  uploadImages,
  getLatestHabitOccurrenceTimestamp,
} from '@services';
import { useHabits, useNoteActions, useOccurrenceActions } from '@stores';
import {
  differenceInDays,
  differenceInHours,
  handleAsyncAction,
  getCurrentCalendarDateTime,
  getCalendarDateTimeFromTimestamp,
} from '@utils';

import OccurrencePhotosUploader from './OccurrencePhotosUploader';

type OccurrenceDialogProps = RequireAtLeastOne<
  {
    existingOccurrence?: Occurrence | null;
    isOpen: boolean;
    newOccurrenceDate?: CalendarDate | null;
    timeZone: string;
    onClose: () => void;
  },
  'newOccurrenceDate' | 'existingOccurrence'
>;

const OccurrenceDialog = ({
  existingOccurrence,
  isOpen,
  newOccurrenceDate,
  onClose,
  timeZone,
}: OccurrenceDialogProps) => {
  const { user } = useUser();
  const habits = useHabits();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote, updateNote } = useNoteActions();
  const { addOccurrence, setOccurrenceNote, updateOccurrence } =
    useOccurrenceActions();
  const [note, handleNoteChange, clearNote] = useTextField();
  const [repeat, setRepeat] = React.useState(1);
  const [selectedHabitId, setSelectedHabitId] = React.useState('');
  const [time, setTime] = React.useState<TimeInputValue | null>(null);
  const [isDateTimeInFuture, setIsDateTimeInFuture] = React.useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [lastLoggedAt, setLastLoggedAt] =
    React.useState<CalendarDateTime | null>(null);
  const { isDesktop, isMobile } = useScreenWidth();
  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'long',
    timeZone,
    year: 'numeric',
  });

  const existingOccurrenceDateTime = React.useMemo(() => {
    if (!existingOccurrence?.timestamp) {
      return null;
    }

    return parseAbsoluteToLocal(
      new Date(existingOccurrence.timestamp).toISOString()
    );
  }, [existingOccurrence?.timestamp]);

  const habitsByTraitName = React.useMemo(() => {
    return groupBy(Object.values(habits), (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

  const hasHabits = Object.keys(habits).length > 0;

  React.useEffect(() => {
    if (existingOccurrence) {
      return;
    }

    if (
      !selectedHabitId ||
      !newOccurrenceDate ||
      !isSameDay(newOccurrenceDate, today(timeZone))
    ) {
      setLastLoggedAt(null);

      return;
    }

    getLatestHabitOccurrenceTimestamp(selectedHabitId).then((timestamp) => {
      setLastLoggedAt(
        timestamp ? getCalendarDateTimeFromTimestamp(timestamp) : null
      );
    });
  }, [existingOccurrence, selectedHabitId, newOccurrenceDate, timeZone]);

  React.useEffect(() => {
    if (!newOccurrenceDate && !existingOccurrence) {
      return;
    }

    if (isOpen && existingOccurrence) {
      setSelectedHabitId(existingOccurrence.habitId.toString());
      handleNoteChange(existingOccurrence.note?.content || '');
      setTime(existingOccurrenceDateTime);

      return;
    }

    if (isOpen && newOccurrenceDate) {
      const { hour, minute } = now(timeZone);

      setTime(
        toZoned(
          toCalendarDateTime(newOccurrenceDate).set({ hour, minute }),
          timeZone
        )
      );
    }
  }, [
    newOccurrenceDate,
    existingOccurrence,
    existingOccurrenceDateTime,
    isOpen,
    handleNoteChange,
    timeZone,
  ]);

  React.useEffect(() => {
    if (!Object.keys(habits).length) {
      return;
    }

    if (newOccurrenceDate) {
      setIsSubmitButtonDisabled(!selectedHabitId);

      return;
    }

    if (existingOccurrence) {
      const hasTimeChanged =
        time instanceof ZonedDateTime &&
        +time.toDate() !== +new Date(existingOccurrence.timestamp);
      const hasNoteChanged = note !== (existingOccurrence.note?.content || '');
      const hasHabitChanged =
        selectedHabitId !== existingOccurrence.habitId.toString();

      const hasOccurrenceChanged =
        hasNoteChanged ||
        hasHabitChanged ||
        hasTimeChanged ||
        uploadedFiles.length > 0;

      setIsSubmitButtonDisabled(
        isSaving || !selectedHabitId || !hasOccurrenceChanged
      );

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
    habits,
  ]);

  React.useEffect(() => {
    if (!time) {
      return;
    }

    if (newOccurrenceDate) {
      const userEnteredDateTime = toCalendarDateTime(newOccurrenceDate).set({
        hour: time.hour,
        minute: time.minute,
      });

      setIsDateTimeInFuture(userEnteredDateTime.compare(now(timeZone)) > 0);

      return;
    }

    if (existingOccurrenceDateTime) {
      setIsDateTimeInFuture(
        existingOccurrenceDateTime
          .set({
            hour: time.hour,
            minute: time.minute,
          })
          .compare(today(timeZone)) > 0
      );
    }
  }, [newOccurrenceDate, existingOccurrenceDateTime, time, timeZone]);

  const handleSubmit = async () => {
    if (
      !user ||
      !(newOccurrenceDate || existingOccurrence) ||
      !hasHabits ||
      !selectedHabitId
    ) {
      return null;
    }

    const occurrenceDateTime = newOccurrenceDate
      ? newOccurrenceDate.toDate(timeZone)
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
        const uploadedPhotoPaths = uploadedFiles.length
          ? await uploadImages(
              StorageBuckets.OCCURRENCE_PHOTOS,
              user.id,
              uploadedFiles,
              selectedHabitId
            )
          : [];

        const photoPaths = (existingOccurrence.photoPaths || []).concat(
          uploadedPhotoPaths
        );

        await updateOccurrence(existingOccurrence.id, {
          habitId: selectedHabitId,
          photoPaths: photoPaths.length ? photoPaths : null,
          timestamp: +occurrenceDateTime,
          userId: user?.id as string,
        });

        if (note) {
          let newNote;

          if (existingOccurrence.note) {
            newNote = await updateNote(existingOccurrence.note.id, {
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

          setOccurrenceNote(existingOccurrence.id, {
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
        habitId: selectedHabitId,
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

        setOccurrenceNote(newOccurrence.id, {
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

  const formatDate = (
    date: CalendarDate | CalendarDateTime | ZonedDateTime | null
  ) => {
    if (!date || isToday(date, timeZone)) {
      return 'today';
    }

    if (isSameDay(date, now(timeZone).subtract({ days: 1 }))) {
      return 'yesterday';
    }

    return dateFormatter.format(date.toDate(timeZone));
  };

  const formatDistanceToNow = (date: CalendarDateTime) => {
    if (['today', 'yesterday'].includes(formatDate(date))) {
      const hoursDifference = differenceInHours(
        date,
        getCurrentCalendarDateTime()
      );

      if (hoursDifference < 1) {
        return 'less than an hour';
      }

      return `${hoursDifference} ${pluralize('hour', hoursDifference)}`;
    }

    const daysDifference = differenceInDays(date, getCurrentCalendarDateTime());

    return `${pluralize('day', daysDifference, true)}`;
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
          {existingOccurrence ? 'Edit' : 'Add'} habit entry for{' '}
          {formatDate(newOccurrenceDate || existingOccurrenceDateTime)}
        </ModalHeader>
        <ModalBody>
          <Select
            variant="faded"
            data-testid="habit-select"
            disableSelectorIconRotation
            selectedKeys={[selectedHabitId]}
            selectorIcon={<ArrowsClockwise />}
            onChange={handleHabitSelectionChange}
            scrollShadowProps={{
              visibility: 'bottom',
            }}
            label={
              hasHabits
                ? 'Habits'
                : 'No habits yet. Create a habit to get started.'
            }
            description={
              lastLoggedAt
                ? `Last logged ${formatDistanceToNow(lastLoggedAt)} ago`
                : 'Choose your habit'
            }
          >
            {Object.entries(habitsByTraitName).map(([traitName, habits]) => {
              if (!habits?.length) {
                return null;
              }

              return (
                <SelectSection
                  showDivider
                  key={traitName}
                  title={traitName}
                  classNames={{
                    heading:
                      'flex w-full sticky top-1 z-20 py-1.5 px-2 pl-4 bg-default-100 shadow-small rounded-small',
                  }}
                >
                  {habits.map((habit) => {
                    return (
                      <SelectItem key={habit.id} textValue={habit.name}>
                        <div className="flex items-center gap-2">
                          <img
                            alt={habit.name}
                            role="habit-icon"
                            className="h-4 w-4"
                            src={getPublicUrl(
                              StorageBuckets.HABIT_ICONS,
                              habit.iconPath
                            )}
                          />
                          <span>{habit.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
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
