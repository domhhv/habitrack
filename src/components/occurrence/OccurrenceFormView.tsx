import type { ButtonProps } from '@heroui/react';
import {
  cn,
  Form,
  Button,
  Select,
  Switch,
  Textarea,
  TimeInput,
  SelectItem,
  SelectSection,
} from '@heroui/react';
import {
  now,
  today,
  toZoned,
  isToday,
  fromDate,
  isSameDay,
  toTimeZone,
  ZonedDateTime,
  getLocalTimeZone,
  type CalendarDate,
  toCalendarDateTime,
  type CalendarDateTime,
} from '@internationalized/date';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import groupBy from 'lodash.groupby';
import isEqual from 'lodash.isequal';
import pluralize from 'pluralize';
import React, { type ChangeEventHandler } from 'react';
import { Link } from 'react-router';

import { SignedImageViewer, MetricValuesSection } from '@components';
import { useTextField, useScreenWidth } from '@hooks';
import type { Habit, Occurrence, MetricValue } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl, getLatestHabitOccurrenceTimestamp } from '@services';

import OccurrencePhotosUploader from './OccurrencePhotosUploader';

const ALL_DAY_TIME = { hour: 12, minute: 0 };

export type OccurrenceFormValues = {
  hasSpecificTime: boolean;
  metricValues: Record<string, MetricValue | undefined>;
  note: string;
  occurredAt: string;
  selectedHabitId: string;
  uploadedFiles: File[];
};

type OccurrenceFormViewProps = {
  dayToLog?: CalendarDate;
  habits: Record<string, Habit>;
  isSaving: boolean;
  occurrenceNote?: { content: string; id: string };
  occurrenceToEdit?: Occurrence;
  onClose: () => void;
  onPhotoDelete?: (path: string) => void;
  onSubmit: (values: OccurrenceFormValues) => void;
};

const OccurrenceFormView = ({
  dayToLog,
  habits,
  isSaving,
  occurrenceNote,
  occurrenceToEdit,
  onClose,
  onPhotoDelete,
  onSubmit,
}: OccurrenceFormViewProps) => {
  const timeZone = getLocalTimeZone();
  const [note, handleNoteChange, clearNote] = useTextField();
  const [selectedHabitId, setSelectedHabitId] = React.useState('');
  const [time, setTime] = React.useState<ZonedDateTime | null>(null);
  const [hasSpecificTime, setHasSpecificTime] = React.useState(true);
  const [isDateTimeInFuture, setIsDateTimeInFuture] = React.useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [lastOccurredAt, setLastOccurredAt] =
    React.useState<CalendarDateTime | null>(null);
  const { isDesktop, isMobile } = useScreenWidth();
  const [metricValues, setMetricValues] = React.useState<
    Record<string, MetricValue | undefined>
  >({});

  const metricDefinitions = React.useMemo(() => {
    if (occurrenceToEdit) {
      return occurrenceToEdit.habit.metricDefinitions;
    }

    if (selectedHabitId && habits[selectedHabitId]) {
      return habits[selectedHabitId].metricDefinitions;
    }

    return [];
  }, [occurrenceToEdit, selectedHabitId, habits]);

  const computeOccurrenceDateTime = React.useCallback(
    (tz = timeZone) => {
      const baseNow = now(tz);

      const getTimeValues = () => {
        if (time) {
          return { hour: time.hour, minute: time.minute };
        }

        return { hour: baseNow.hour, minute: baseNow.minute };
      };

      if (dayToLog) {
        const timeToSet = hasSpecificTime ? getTimeValues() : ALL_DAY_TIME;

        return toZoned(toCalendarDateTime(dayToLog).set(timeToSet), tz);
      }

      if (hasSpecificTime) {
        const base = occurrenceToEdit?.occurredAt ?? baseNow;
        const { hour, minute } = getTimeValues();

        return toTimeZone(base.set({ hour, minute }), tz);
      }

      const baseDateTime = occurrenceToEdit?.occurredAt ?? baseNow;

      return toZoned(toCalendarDateTime(baseDateTime).set(ALL_DAY_TIME), tz);
    },
    [dayToLog, occurrenceToEdit?.occurredAt, hasSpecificTime, time, timeZone]
  );

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

    if (occurrenceToEdit) {
      setSelectedHabitId(occurrenceToEdit.habitId);
      handleNoteChange(occurrenceNote?.content || '');
      setTime(occurrenceToEdit.occurredAt);
      setHasSpecificTime(occurrenceToEdit.hasSpecificTime);

      const initialMetricValues: Record<string, MetricValue | undefined> = {};

      for (const mv of occurrenceToEdit.metricValues) {
        initialMetricValues[mv.habitMetricId] = mv.value as MetricValue;
      }

      setMetricValues(initialMetricValues);

      return;
    }

    if (dayToLog) {
      const { hour, minute } = now(timeZone);

      setTime(
        toZoned(toCalendarDateTime(dayToLog).set({ hour, minute }), timeZone)
      );
    }
  }, [
    dayToLog,
    occurrenceNote?.content,
    occurrenceToEdit,
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
        !!time.compare(occurrenceToEdit.occurredAt);
      const hasNoteChanged = note !== (occurrenceNote?.content || '');
      const hasHabitChanged = selectedHabitId !== occurrenceToEdit.habitId;
      const hasSpecificTimeChanged =
        hasSpecificTime !== occurrenceToEdit.hasSpecificTime;

      const hasMetricValuesChanged = (() => {
        const existingMetricValues: Record<string, MetricValue> = {};

        for (const mv of occurrenceToEdit.metricValues) {
          existingMetricValues[mv.habitMetricId] = mv.value as MetricValue;
        }

        const allMetricIds = new Set<string>([
          ...Object.keys(existingMetricValues),
          ...Object.keys(metricValues),
        ]);

        for (const metricId of allMetricIds) {
          const existingValue = existingMetricValues[metricId];
          const newValue = metricValues[metricId];

          if (!isEqual(existingValue, newValue)) {
            return true;
          }
        }

        return false;
      })();

      const hasOccurrenceChanged =
        hasNoteChanged ||
        hasHabitChanged ||
        hasTimeChanged ||
        hasSpecificTimeChanged ||
        hasMetricValuesChanged ||
        uploadedFiles.length > 0;

      setIsSubmitButtonDisabled(
        isSaving || !selectedHabitId || !hasOccurrenceChanged
      );

      return;
    }
  }, [
    dayToLog,
    occurrenceToEdit,
    occurrenceNote?.content,
    uploadedFiles.length,
    note,
    selectedHabitId,
    time,
    hasSpecificTime,
    isSaving,
    habits,
    metricValues,
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

    if (occurrenceToEdit) {
      setIsDateTimeInFuture(
        occurrenceToEdit.occurredAt
          .set({
            hour: time.hour,
            minute: time.minute,
          })
          .compare(now(timeZone)) > 0
      );
    }
  }, [dayToLog, occurrenceToEdit, time, timeZone]);

  const handleSubmit = () => {
    if (!(dayToLog || occurrenceToEdit) || !hasHabits || !selectedHabitId) {
      return;
    }

    const effectiveTimeZone = occurrenceToEdit?.timeZone ?? timeZone;
    const occurredAt =
      computeOccurrenceDateTime(effectiveTimeZone).toAbsoluteString();

    onSubmit({
      hasSpecificTime,
      metricValues,
      note,
      occurredAt,
      selectedHabitId,
      uploadedFiles,
    });
  };

  const handleClose = () => {
    setSelectedHabitId('');
    clearNote();
    setUploadedFiles([]);
    setMetricValues({});
    setHasSpecificTime(true);
    onClose();
  };

  const handleHabitSelectionChange: ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setSelectedHabitId(e.target.value);
    setMetricValues({});
  };

  const formatDistanceToNow = (date: CalendarDateTime) => {
    const dateZ = toZoned(date, timeZone);

    const nowZ = now(timeZone);
    const diffMs = nowZ.toDate().getTime() - dateZ.toDate().getTime();

    const isYesterday = isSameDay(dateZ, now(timeZone).subtract({ days: 1 }));

    if (isYesterday || isToday(dateZ, timeZone)) {
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
      <MetricValuesSection
        values={metricValues}
        onChange={setMetricValues}
        metricDefinitions={metricDefinitions}
      />
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
      {onPhotoDelete && (
        <SignedImageViewer
          onDelete={onPhotoDelete}
          bucket={StorageBuckets.OCCURRENCE_PHOTOS}
          paths={occurrenceToEdit?.photoPaths || null}
        />
      )}
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
          onPress={handleClose}
        >
          Go to Habits
        </Button>
      )}
    </Form>
  );
};

export default OccurrenceFormView;
