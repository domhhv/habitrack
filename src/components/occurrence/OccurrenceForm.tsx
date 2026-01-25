import type { ButtonProps, TimeInputValue } from '@heroui/react';
import {
  cn,
  Form,
  Button,
  Select,
  Switch,
  Textarea,
  TimeInput,
  SelectItem,
  NumberInput,
  SelectSection,
} from '@heroui/react';
import {
  now,
  today,
  toZoned,
  fromDate,
  isSameDay,
  ZonedDateTime,
  parseAbsolute,
  getLocalTimeZone,
  type CalendarDate,
  toCalendarDateTime,
  type CalendarDateTime,
} from '@internationalized/date';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import groupBy from 'lodash.groupby';
import pluralize from 'pluralize';
import React, { type ChangeEventHandler } from 'react';
import { Link } from 'react-router';

import { SignedImageViewer } from '@components';
import { useTextField, useScreenWidth } from '@hooks';
import { StorageBuckets } from '@models';
import {
  getPublicUrl,
  uploadImages,
  getLatestHabitOccurrenceTimestamp,
} from '@services';
import {
  useUser,
  useHabits,
  useNoteActions,
  useOccurrenceActions,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrencePhotosUploader from './OccurrencePhotosUploader';

const ALL_DAY_TIME = { hour: 12, minute: 0 };

type OccurrenceFormProps = {
  existingOccurrenceDateTime: ZonedDateTime | null;
  formatDate: (
    date: CalendarDate | CalendarDateTime | ZonedDateTime | null
  ) => string;
};

const OccurrenceForm = ({
  existingOccurrenceDateTime,
  formatDate,
}: OccurrenceFormProps) => {
  const timeZone = getLocalTimeZone();
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { dayToLog, isOpen, occurrenceToEdit } = useOccurrenceDrawerState();
  const { user } = useUser();
  const habits = useHabits();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const { addOccurrence, setOccurrenceNote, updateOccurrence } =
    useOccurrenceActions();
  const [note, handleNoteChange, clearNote] = useTextField();
  const [repeat, setRepeat] = React.useState(1);
  const [selectedHabitId, setSelectedHabitId] = React.useState('');
  const [time, setTime] = React.useState<TimeInputValue | null>(null);
  const [hasSpecificTime, setHasSpecificTime] = React.useState(true);
  const [isDateTimeInFuture, setIsDateTimeInFuture] = React.useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [lastOccurredAt, setLastOccurredAt] =
    React.useState<CalendarDateTime | null>(null);
  const { isDesktop, isMobile } = useScreenWidth();

  const computeOccurrenceDateTime = React.useCallback(() => {
    const baseNow = now(timeZone);

    const getTimeValues = () => {
      if (time) {
        return { hour: time.hour, minute: time.minute };
      }

      return { hour: baseNow.hour, minute: baseNow.minute };
    };

    if (dayToLog) {
      const timeToSet = hasSpecificTime ? getTimeValues() : ALL_DAY_TIME;

      return toZoned(toCalendarDateTime(dayToLog).set(timeToSet), timeZone);
    }

    if (hasSpecificTime) {
      const base = existingOccurrenceDateTime ?? baseNow;
      const { hour, minute } = getTimeValues();

      return toZoned(toCalendarDateTime(base).set({ hour, minute }), timeZone);
    }

    const baseDateTime = existingOccurrenceDateTime ?? baseNow;

    return toZoned(
      toCalendarDateTime(baseDateTime).set(ALL_DAY_TIME),
      timeZone
    );
  }, [dayToLog, existingOccurrenceDateTime, hasSpecificTime, time, timeZone]);

  const habitsByTraitName = React.useMemo(() => {
    return groupBy(Object.values(habits), (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

  const hasHabits = Object.keys(habits).length > 0;

  React.useEffect(() => {
    if (occurrenceToEdit) {
      return;
    }

    if (
      !selectedHabitId ||
      !dayToLog ||
      !isSameDay(dayToLog, today(timeZone))
    ) {
      setLastOccurredAt(null);

      return;
    }

    getLatestHabitOccurrenceTimestamp(selectedHabitId)
      .then((timestamp) => {
        setLastOccurredAt(
          timestamp
            ? toCalendarDateTime(fromDate(new Date(timestamp), timeZone))
            : null
        );
      })
      .catch(() => {
        setLastOccurredAt(null);
      });
  }, [occurrenceToEdit, selectedHabitId, dayToLog, timeZone]);

  React.useEffect(() => {
    if (!dayToLog && !occurrenceToEdit) {
      return;
    }

    if (isOpen && occurrenceToEdit) {
      setSelectedHabitId(occurrenceToEdit.habitId.toString());
      handleNoteChange(occurrenceToEdit.note?.content || '');
      setTime(existingOccurrenceDateTime);
      setHasSpecificTime(occurrenceToEdit.hasSpecificTime);

      return;
    }

    if (isOpen && dayToLog) {
      const { hour, minute } = now(timeZone);

      setTime(
        toZoned(toCalendarDateTime(dayToLog).set({ hour, minute }), timeZone)
      );
    }
  }, [
    dayToLog,
    occurrenceToEdit,
    existingOccurrenceDateTime,
    isOpen,
    handleNoteChange,
    timeZone,
  ]);

  React.useEffect(() => {
    if (!Object.keys(habits).length) {
      return;
    }

    if (dayToLog) {
      setIsSubmitButtonDisabled(!selectedHabitId);

      return;
    }

    if (occurrenceToEdit) {
      const hasTimeChanged =
        time instanceof ZonedDateTime &&
        time.toString() !==
          parseAbsolute(
            occurrenceToEdit.occurredAt,
            occurrenceToEdit.timeZone
          ).toString();
      const hasNoteChanged = note !== (occurrenceToEdit.note?.content || '');
      const hasHabitChanged =
        selectedHabitId !== occurrenceToEdit.habitId.toString();
      const hasSpecificTimeChanged =
        hasSpecificTime !== occurrenceToEdit.hasSpecificTime;

      const hasOccurrenceChanged =
        hasNoteChanged ||
        hasHabitChanged ||
        hasTimeChanged ||
        hasSpecificTimeChanged ||
        uploadedFiles.length > 0;

      setIsSubmitButtonDisabled(
        isSaving || !selectedHabitId || !hasOccurrenceChanged
      );

      return;
    }
  }, [
    dayToLog,
    occurrenceToEdit,
    uploadedFiles.length,
    note,
    selectedHabitId,
    time,
    hasSpecificTime,
    isSaving,
    habits,
  ]);

  React.useEffect(() => {
    if (!time) {
      return;
    }

    if (dayToLog) {
      const userEnteredDateTime = toCalendarDateTime(dayToLog).set({
        hour: time.hour,
        minute: time.minute,
      });

      setIsDateTimeInFuture(
        toZoned(userEnteredDateTime, timeZone).compare(now(timeZone)) > 0
      );

      return;
    }

    if (existingOccurrenceDateTime) {
      setIsDateTimeInFuture(
        existingOccurrenceDateTime
          .set({
            hour: time.hour,
            minute: time.minute,
          })
          .compare(now(timeZone)) > 0
      );
    }
  }, [dayToLog, existingOccurrenceDateTime, time, timeZone]);

  const handleSubmit = async () => {
    if (
      !user ||
      !(dayToLog || occurrenceToEdit) ||
      !hasHabits ||
      !selectedHabitId
    ) {
      return null;
    }

    const occurredAt = computeOccurrenceDateTime().toAbsoluteString();

    setIsSaving(true);

    if (occurrenceToEdit) {
      const updatePromise = async () => {
        const uploadedPhotoPaths = uploadedFiles.length
          ? await uploadImages(
              StorageBuckets.OCCURRENCE_PHOTOS,
              user.id,
              uploadedFiles,
              selectedHabitId
            )
          : [];

        const photoPaths = (occurrenceToEdit.photoPaths || []).concat(
          uploadedPhotoPaths
        );

        await updateOccurrence(occurrenceToEdit.id, {
          habitId: selectedHabitId,
          hasSpecificTime,
          occurredAt,
          photoPaths: photoPaths.length ? photoPaths : null,
          timeZone,
          userId: user?.id as string,
        });

        if (note) {
          let newNote;

          if (occurrenceToEdit.note) {
            newNote = await updateNote(occurrenceToEdit.note.id, {
              content: note,
              occurrenceId: occurrenceToEdit.id,
            });
          } else {
            newNote = await addNote({
              content: note,
              occurrenceId: occurrenceToEdit.id,
              userId: user.id,
            });
          }

          setOccurrenceNote(occurrenceToEdit.id, {
            content: newNote.content,
            id: newNote.id,
          });
        } else if (occurrenceToEdit.note) {
          await deleteNote(occurrenceToEdit.note.id);

          setOccurrenceNote(occurrenceToEdit.id, null);
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
        hasSpecificTime,
        occurredAt,
        photoPaths,
        timeZone,
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
    setRepeat(1);
    setUploadedFiles([]);
    setHasSpecificTime(true);
    closeOccurrenceDrawer();
  };

  const handleHabitSelectionChange: ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setSelectedHabitId(e.target.value);
  };

  const formatDistanceToNow = (date: CalendarDateTime) => {
    const dateZ = toZoned(date, timeZone);

    const nowZ = now(timeZone);
    const diffMs = nowZ.toDate().getTime() - dateZ.toDate().getTime();

    if (['today', 'yesterday'].includes(formatDate(date))) {
      const hoursDifference = Math.floor(diffMs / (1000 * 60 * 60));

      if (hoursDifference < 1) {
        return 'less than an hour';
      }

      return `${hoursDifference} ${pluralize('hour', hoursDifference)}`;
    }

    const daysDifference = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return `${pluralize('day', daysDifference, true)}`;
  };

  const submitButtonSharedProps: ButtonProps = {
    color: 'primary',
    isDisabled: isSubmitButtonDisabled,
    isLoading: isSaving,
  };

  return (
    <Form>
      <Select
        size="sm"
        variant="faded"
        maxListboxHeight={400}
        data-testid="habit-select"
        disableSelectorIconRotation
        selectedKeys={[selectedHabitId]}
        onChange={handleHabitSelectionChange}
        selectorIcon={<ArrowsClockwiseIcon />}
        scrollShadowProps={{
          visibility: 'bottom',
        }}
        label={
          hasHabits ? 'Habits' : 'No habits yet. Create a habit to get started.'
        }
        description={
          lastOccurredAt
            ? `Last logged ${formatDistanceToNow(lastOccurredAt)} ago`
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
      {!occurrenceToEdit && (
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
      <div className="w-full space-y-2">
        <div className={cn('flex gap-2', !hasSpecificTime && 'py-2')}>
          <Switch
            size="sm"
            className="basis-full"
            isSelected={hasSpecificTime}
            onValueChange={setHasSpecificTime}
          >
            Specify time
          </Switch>
          {hasSpecificTime && (
            <TimeInput
              value={time}
              variant="faded"
              onChange={setTime}
              size={isMobile ? 'sm' : 'md'}
              classNames={
                !isDesktop
                  ? {
                      input: 'text-base',
                      inputWrapper: 'h-10',
                    }
                  : undefined
              }
            />
          )}
        </div>
        {isDateTimeInFuture && hasSpecificTime && (
          <p className="text-sm text-gray-600">
            You are logging a habit for the future. Are you a time traveler?
          </p>
        )}
      </div>
      <OccurrencePhotosUploader
        files={uploadedFiles}
        onFilesChange={setUploadedFiles}
        photoPaths={occurrenceToEdit?.photoPaths || null}
      />
      <SignedImageViewer
        bucket={StorageBuckets.OCCURRENCE_PHOTOS}
        paths={occurrenceToEdit?.photoPaths || null}
        onDelete={(path) => {
          if (!occurrenceToEdit?.photoPaths) {
            return;
          }

          void updateOccurrence(occurrenceToEdit.id, {
            photoPaths: occurrenceToEdit.photoPaths.filter((p) => {
              return p !== path;
            }),
          });
        }}
      />
      {hasHabits ? (
        <Button {...submitButtonSharedProps} fullWidth onPress={handleSubmit}>
          {occurrenceToEdit ? 'Update' : 'Add'}
        </Button>
      ) : (
        <Button
          as={Link}
          to="/habits"
          {...submitButtonSharedProps}
          fullWidth
          onPress={closeOccurrenceDrawer}
        >
          Go to Habits
        </Button>
      )}
    </Form>
  );
};

export default OccurrenceForm;
