import type { Selection, ButtonProps } from '@heroui/react';
import {
  cn,
  Form,
  Button,
  Switch,
  Listbox,
  Checkbox,
  Textarea,
  TimeInput,
  NumberInput,
  ListboxItem,
  ListboxSection,
} from '@heroui/react';
import {
  now,
  toZoned,
  isToday,
  isSameDay,
  toTimeZone,
  ZonedDateTime,
  parseAbsolute,
  getLocalTimeZone,
  type CalendarDate,
  toCalendarDateTime,
} from '@internationalized/date';
import groupBy from 'lodash.groupby';
import isEqual from 'lodash.isequal';
import pluralize from 'pluralize';
import React from 'react';
import { Link } from 'react-router';

import { SignedImageViewer, MetricValuesSection } from '@components';
import { useTextField, useScreenWidth } from '@hooks';
import type { Habit, Occurrence, MetricValue } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl, getLatestHabitOccurrence } from '@services';
import { useHabits } from '@stores';

import OccurrenceChip from './OccurrenceChip';
import OccurrencePhotosUploader from './OccurrencePhotosUploader';

const ALL_DAY_TIME = { hour: 12, minute: 0 };

export type OccurrenceFormValues = {
  depletedStockIds: string[];
  hasSpecificTime: boolean;
  metricValues: Record<string, MetricValue | undefined>;
  note: string;
  occurredAt: string;
  selectedHabitId: string;
  stockUsages: { habitStockId: string; quantity: number | null }[];
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
    React.useState<ZonedDateTime | null>(null);
  const [previousMetricValues, setPreviousMetricValues] = React.useState<
    Record<string, MetricValue | undefined>
  >({});
  const { isDesktop, isMobile } = useScreenWidth();
  const [metricValues, setMetricValues] = React.useState<
    Record<string, MetricValue | undefined>
  >({});
  const [autoCompoundedMetricIds, setAutoCompoundedMetricIds] = React.useState<
    Record<string, boolean>
  >({});
  const allHabits = useHabits();
  const habitStocks = React.useMemo(() => {
    if (!selectedHabitId || !allHabits[selectedHabitId]) {
      return [];
    }

    return allHabits[selectedHabitId].stocks;
  }, [selectedHabitId, allHabits]);
  const [stockSelections, setStockSelections] = React.useState<
    Record<string, number | null>
  >({});
  const [depletedStockIds, setDepletedStockIds] = React.useState<Set<string>>(
    new Set()
  );

  const existingUsageStockIds = React.useMemo(() => {
    if (!occurrenceToEdit) {
      return new Set<string>();
    }

    return new Set(
      occurrenceToEdit.stockUsages.map((usage) => {
        return usage.habitStockId;
      })
    );
  }, [occurrenceToEdit]);

  const activeStocks = React.useMemo(() => {
    return habitStocks.filter((stock) => {
      return !stock.isDepleted || existingUsageStockIds.has(stock.id);
    });
  }, [habitStocks, existingUsageStockIds]);

  const selectedStocks = React.useMemo(() => {
    return activeStocks.filter((stock) => {
      return Object.prototype.hasOwnProperty.call(stockSelections, stock.id);
    });
  }, [activeStocks, stockSelections]);

  const metricDefinitions = React.useMemo(() => {
    if (occurrenceToEdit) {
      return occurrenceToEdit.habit.metricDefinitions;
    }

    if (selectedHabitId && habits[selectedHabitId]) {
      return habits[selectedHabitId].metricDefinitions;
    }

    return [];
  }, [occurrenceToEdit, selectedHabitId, habits]);

  React.useEffect(() => {
    if (selectedStocks.length === 0) {
      setAutoCompoundedMetricIds((prev) => {
        return Object.keys(prev).length === 0 ? prev : {};
      });

      return;
    }

    const compoundSums: Record<string, number> = {};
    const compoundMetricIds = new Set<string>();

    for (const stock of selectedStocks) {
      const quantity = stockSelections[stock.id] ?? 1;

      for (const metricDefault of stock.metricDefaults) {
        if (!metricDefault.shouldCompound) {
          continue;
        }

        const metricDefinition = metricDefinitions.find((definition) => {
          return definition.id === metricDefault.habitMetricId;
        });

        if (metricDefinition?.type !== 'number') {
          continue;
        }

        const numericValue = metricDefault.value as MetricValue | undefined as
          | { numericValue: number }
          | undefined;

        if (!numericValue || typeof numericValue.numericValue !== 'number') {
          continue;
        }

        compoundMetricIds.add(metricDefault.habitMetricId);
        compoundSums[metricDefault.habitMetricId] =
          (compoundSums[metricDefault.habitMetricId] || 0) +
          numericValue.numericValue * quantity;
      }
    }

    setMetricValues((prev) => {
      let hasChanges = false;
      const next = { ...prev };

      for (const stock of selectedStocks) {
        for (const metricDefault of stock.metricDefaults) {
          const metricId = metricDefault.habitMetricId;

          if (metricDefault.shouldCompound && compoundMetricIds.has(metricId)) {
            const shouldOverride =
              prev[metricId] === undefined || autoCompoundedMetricIds[metricId];

            if (shouldOverride) {
              next[metricId] = {
                numericValue: compoundSums[metricId] ?? 0,
              } as MetricValue;
              hasChanges = true;
            }

            continue;
          }

          if (next[metricId] === undefined) {
            next[metricId] = metricDefault.value as MetricValue;
            hasChanges = true;
          }
        }
      }

      return hasChanges ? next : prev;
    });

    setAutoCompoundedMetricIds((prev) => {
      const prevKeys = Object.keys(prev);

      if (
        prevKeys.length === compoundMetricIds.size &&
        prevKeys.every((key) => {
          return compoundMetricIds.has(key);
        })
      ) {
        return prev;
      }

      const next: Record<string, boolean> = {};

      for (const metricId of compoundMetricIds) {
        next[metricId] = true;
      }

      return next;
    });
  }, [
    selectedStocks,
    stockSelections,
    metricDefinitions,
    autoCompoundedMetricIds,
  ]);

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

    if (!selectedHabitId || !dayToLog) {
      setLastOccurredAt(null);
      setPreviousMetricValues({});

      return;
    }

    getLatestHabitOccurrence(selectedHabitId)
      .then((occurrence) => {
        if (!occurrence) {
          setLastOccurredAt(null);
          setPreviousMetricValues({});

          return;
        }

        const lastOccurrenceZdt = parseAbsolute(
          occurrence.occurredAt,
          timeZone
        );

        if (dayToLog.compare(lastOccurrenceZdt) < 0) {
          setLastOccurredAt(null);
          setPreviousMetricValues({});

          return;
        }

        setLastOccurredAt(lastOccurrenceZdt);

        const prevMetrics: Record<string, MetricValue | undefined> = {};

        for (const mv of occurrence.metricValues) {
          prevMetrics[mv.habitMetricId] = mv.value as MetricValue;
        }

        setPreviousMetricValues(prevMetrics);
      })
      .catch(() => {
        setLastOccurredAt(null);
        setPreviousMetricValues({});
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
      setDepletedStockIds(new Set());
      setAutoCompoundedMetricIds({});

      const initialStockSelections: Record<string, number | null> = {};

      for (const usage of occurrenceToEdit.stockUsages) {
        initialStockSelections[usage.habitStockId] = usage.quantity;
      }

      setStockSelections(initialStockSelections);

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

      const hasStockUsagesChanged = (() => {
        const existingUsages: Record<string, number | null> = {};

        for (const usage of occurrenceToEdit.stockUsages) {
          existingUsages[usage.habitStockId] = usage.quantity;
        }

        return !isEqual(existingUsages, stockSelections);
      })();

      const hasOccurrenceChanged =
        hasNoteChanged ||
        hasTimeChanged ||
        hasSpecificTimeChanged ||
        hasMetricValuesChanged ||
        hasStockUsagesChanged ||
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
    stockSelections,
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

    const hasExcessiveQuantity = selectedStocks.some((stock) => {
      const quantity = stockSelections[stock.id];

      return (
        quantity !== null &&
        stock.remainingItems !== null &&
        quantity > stock.remainingItems
      );
    });

    if (hasExcessiveQuantity) {
      return;
    }

    const effectiveTimeZone = occurrenceToEdit?.timeZone ?? timeZone;
    const occurredAt =
      computeOccurrenceDateTime(effectiveTimeZone).toAbsoluteString();
    const stockUsages = Object.entries(stockSelections).map(
      ([habitStockId, quantity]) => {
        return {
          habitStockId,
          quantity: quantity ?? null,
        };
      }
    );

    onSubmit({
      depletedStockIds: [...depletedStockIds],
      hasSpecificTime,
      metricValues,
      note,
      occurredAt,
      selectedHabitId,
      stockUsages,
      uploadedFiles,
    });
  };

  const handleClose = () => {
    setSelectedHabitId('');
    clearNote();
    setUploadedFiles([]);
    setMetricValues({});
    setHasSpecificTime(true);
    setStockSelections({});
    setDepletedStockIds(new Set());
    setAutoCompoundedMetricIds({});
    onClose();
  };

  const handleHabitSelectionChange = (keys: Selection) => {
    const id = [...keys][0] as string;

    if (id) {
      setSelectedHabitId(id);
      setMetricValues({});
      setStockSelections({});
      setDepletedStockIds(new Set());
      setAutoCompoundedMetricIds({});
    }
  };

  const handleStockSelectionChange = (
    stockId: string,
    isSelected: boolean,
    defaultQuantity: number | null
  ) => {
    setStockSelections((prev) => {
      const next = { ...prev };

      if (isSelected) {
        next[stockId] = prev[stockId] ?? defaultQuantity;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete next[stockId];
      }

      return next;
    });

    if (!isSelected) {
      setDepletedStockIds((prev) => {
        if (!prev.has(stockId)) {
          return prev;
        }

        const next = new Set(prev);

        next.delete(stockId);

        return next;
      });
    }
  };

  const handleStockQuantityChange = (
    stockId: string,
    quantity: number | null,
    maxQuantity: number | null
  ) => {
    const clamped =
      quantity !== null && maxQuantity !== null
        ? Math.min(quantity, maxQuantity)
        : quantity;

    setStockSelections((prev) => {
      return { ...prev, [stockId]: clamped };
    });
  };

  const formatDistanceToNow = (date: ZonedDateTime) => {
    const diffMs = now(timeZone).toDate().getTime() - date.toDate().getTime();

    const isYesterday = isSameDay(date, now(timeZone).subtract({ days: 1 }));

    if (isYesterday || isToday(date, timeZone)) {
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
      {occurrenceToEdit ? (
        <OccurrenceChip
          isHabitNameShown
          hasMargin={false}
          hasCounter={false}
          hasTooltip={false}
          isClickable={false}
          occurrences={[occurrenceToEdit]}
        />
      ) : hasHabits ? (
        <>
          <div className="rounded-medium order-medium border-default-200 hover:border-default-400 focus-within:border-default-400 max-h-100 w-full overflow-y-auto border-2 px-3 py-2">
            <Listbox
              aria-label="Habits"
              disallowEmptySelection
              selectionMode="single"
              onSelectionChange={handleHabitSelectionChange}
              selectedKeys={new Set(selectedHabitId ? [selectedHabitId] : [])}
            >
              {Object.entries(habitsByTraitName).map(([traitName, habits]) => {
                if (!habits?.length) {
                  return null;
                }

                return (
                  <ListboxSection
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
                        <ListboxItem key={habit.id} textValue={habit.name}>
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
                        </ListboxItem>
                      );
                    })}
                  </ListboxSection>
                );
              })}
            </Listbox>
          </div>
          <p className="text-tiny text-foreground-400">
            {lastOccurredAt
              ? `Last logged ${formatDistanceToNow(lastOccurredAt)} ago`
              : 'Choose your habit'}
          </p>
        </>
      ) : (
        <p className="text-foreground-500 text-sm">
          No habits yet. Create a habit to get started.
        </p>
      )}
      {selectedHabitId && activeStocks.length > 0 && (
        <div className="space-y-2">
          <div>
            <p className="text-foreground-500 text-tiny font-medium">
              Stock usage
            </p>
            <p className="text-foreground-400 text-tiny">
              Select a stock to auto-populate metric values.
            </p>
          </div>
          <div className="space-y-2">
            {activeStocks.map((stock) => {
              const isSelected = Object.prototype.hasOwnProperty.call(
                stockSelections,
                stock.id
              );
              const isQuantifiable = stock.totalItems !== null;

              return (
                <div key={stock.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <Checkbox
                      size="sm"
                      isSelected={isSelected}
                      onValueChange={(nextSelected) => {
                        return handleStockSelectionChange(
                          stock.id,
                          nextSelected,
                          isQuantifiable ? 1 : null
                        );
                      }}
                    >
                      <span className="truncate">{stock.name}</span>
                    </Checkbox>
                    {isQuantifiable && (
                      <NumberInput
                        size="sm"
                        minValue={1}
                        className="w-24"
                        isDisabled={!isSelected}
                        aria-label={`${stock.name} quantity`}
                        maxValue={stock.remainingItems ?? undefined}
                        value={(stockSelections[stock.id] ?? 1) as number}
                        onValueChange={(value) => {
                          return handleStockQuantityChange(
                            stock.id,
                            value ?? 1,
                            stock.remainingItems
                          );
                        }}
                      />
                    )}
                  </div>
                  {isSelected && !isQuantifiable && (
                    <Checkbox
                      size="sm"
                      className="pl-7"
                      isSelected={depletedStockIds.has(stock.id)}
                      onValueChange={(checked) => {
                        setDepletedStockIds((prev) => {
                          const next = new Set(prev);

                          if (checked) {
                            next.add(stock.id);
                          } else {
                            next.delete(stock.id);
                          }

                          return next;
                        });
                      }}
                    >
                      <span className="text-foreground-400 text-tiny">
                        Mark as depleted
                      </span>
                    </Checkbox>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <MetricValuesSection
        values={metricValues}
        metricDefinitions={metricDefinitions}
        previousValues={previousMetricValues}
        onChange={(nextValues) => {
          setMetricValues(nextValues);

          setAutoCompoundedMetricIds((prev) => {
            const next = { ...prev };

            for (const metricId of Object.keys(next)) {
              const prevValue = metricValues[metricId];
              const nextValue = nextValues[metricId];

              if (!isEqual(prevValue, nextValue)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete next[metricId];
              }
            }

            return next;
          });
        }}
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
