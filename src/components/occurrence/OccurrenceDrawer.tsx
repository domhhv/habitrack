import { Drawer, Tooltip } from '@heroui/react';
import type { ZonedDateTime } from '@internationalized/date';
import {
  now,
  today,
  toZoned,
  isToday,
  isSameDay,
  toLocalTimeZone,
  getLocalTimeZone,
} from '@internationalized/date';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { useFetcher } from 'react-router';

import { CustomButton } from '@components';
import { useScreenWidth, useCalendarData, useOccurrenceToEdit } from '@hooks';
import type { Occurrence, OccurrenceSubmission } from '@models';
import {
  useConfirmationActions,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';

import OccurrenceChip from './OccurrenceChip';
import OccurrenceCreateFormContainer from './OccurrenceCreateFormContainer';
import OccurrenceList from './OccurrenceList';
import OccurrenceUpdateFormContainer from './OccurrenceUpdateFormContainer';

const OccurrenceDrawer = () => {
  const timeZone = getLocalTimeZone();
  const { occurrencesByDate: occurrences } = useCalendarData();
  const deleteFetcher = useFetcher();
  const [removalTargetId, setRemovalTargetId] = React.useState('');
  const occurrenceIdBeingRemoved =
    deleteFetcher.state === 'idle' ? '' : removalTargetId;
  const { askConfirmation } = useConfirmationActions();
  const { isMobile } = useScreenWidth();
  const {
    dayToDisplay,
    dayToLog,
    habitIdToDisplay,
    isOpen,
    occurrenceIdToEdit,
  } = useOccurrenceDrawerState();
  const occurrenceToEdit = useOccurrenceToEdit();
  const { closeOccurrenceDrawer, setDayToDisplay } =
    useOccurrenceDrawerActions();
  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone,
    year: 'numeric',
  });
  const occurrencesData = React.useMemo(() => {
    if (!dayToDisplay) {
      return null;
    }

    const dayOccurrences = occurrences[dayToDisplay.toString()] || {};

    const filteredOccurrences = Object.values(dayOccurrences).filter((o) => {
      const occurrenceDate = toLocalTimeZone(o.occurredAt);

      return (
        isSameDay(occurrenceDate, dayToDisplay || today(timeZone)) &&
        (habitIdToDisplay ? o.habitId === habitIdToDisplay : true)
      );
    });

    const occurrencesWithTime = filteredOccurrences.filter((o) => {
      return o.hasSpecificTime;
    });

    const occurrencesWithoutTime = filteredOccurrences.filter((o) => {
      return !o.hasSpecificTime;
    });

    const hasOccurrencesWithTime = !!occurrencesWithTime.length;
    const hasOccurrencesWithoutTime = !!occurrencesWithoutTime.length;

    const hasOccurrencesWithAndWithoutTime =
      hasOccurrencesWithTime && hasOccurrencesWithoutTime;

    return {
      dayOccurrences: habitIdToDisplay ? null : filteredOccurrences,
      habitOccurrences: habitIdToDisplay ? filteredOccurrences : null,
      hasOccurrencesWithAndWithoutTime,
      hasOccurrencesWithoutTime,
      hasOccurrencesWithTime,
      occurrencesWithoutTime,
      occurrencesWithTime,
    };
  }, [dayToDisplay, habitIdToDisplay, occurrences, timeZone]);

  const dispatchOccurrenceRemoval = async (occurrence: Occurrence) => {
    if (deleteFetcher.state !== 'idle' || !(await askConfirmation())) {
      return;
    }

    setRemovalTargetId(occurrence.id);
    void deleteFetcher.submit(
      {
        intent: 'delete',
        occurrenceId: occurrence.id,
      } satisfies OccurrenceSubmission,
      {
        action: '/resources/occurrences',
        encType: 'application/json',
        method: 'post',
      }
    );
  };

  const changeOpen = (isOpen: boolean) => {
    if (!isOpen) {
      closeOccurrenceDrawer();
    }
  };

  const formatDate = (date: ZonedDateTime = now(timeZone)) => {
    if (isToday(date, timeZone)) {
      return 'today';
    }

    if (isSameDay(date, now(timeZone).subtract({ days: 1 }))) {
      return 'yesterday';
    }

    return dateFormatter.format(date.toDate());
  };

  const canNavigateDays = !!dayToDisplay && !dayToLog && !occurrenceIdToEdit;

  const navigateDay = (direction: -1 | 1) => {
    if (!dayToDisplay) {
      return;
    }

    const newDate =
      direction === -1
        ? dayToDisplay.subtract({ days: 1 })
        : dayToDisplay.add({ days: 1 });

    setDayToDisplay(newDate);
  };

  const getMainTitle = () => {
    if (dayToLog || occurrenceIdToEdit) {
      return (
        <>
          {occurrenceIdToEdit ? 'Edit' : 'Add'} habit entry for{' '}
          {formatDate(
            (dayToLog && toZoned(dayToLog, timeZone)) ||
              occurrenceToEdit?.occurredAt
          )}
        </>
      );
    }

    if (!occurrencesData) {
      return null;
    }

    if (occurrencesData.habitOccurrences?.length) {
      const [{ habit, occurredAt }] = occurrencesData.habitOccurrences;

      return (
        <div className="flex items-center gap-2">
          <OccurrenceChip
            hasMargin={false}
            hasCounter={false}
            hasTooltip={false}
            isClickable={false}
            occurrences={occurrencesData.habitOccurrences}
          />
          <p>
            {habit.name} | {dateFormatter.format(occurredAt.toDate())}
          </p>
        </div>
      );
    }

    if (occurrencesData.dayOccurrences?.length) {
      const [{ occurredAt }] = occurrencesData.dayOccurrences;

      return (
        <div className="flex items-center gap-2">
          <p>Habits Log | {dateFormatter.format(occurredAt.toDate())}</p>
        </div>
      );
    }

    if (dayToDisplay) {
      return (
        <div className="space-y-2">
          <p>
            Habits Log | {dateFormatter.format(dayToDisplay.toDate(timeZone))}
          </p>
          <p className="text-sm">No habits found</p>
        </div>
      );
    }
  };

  return (
    <Drawer isOpen={isOpen} onOpenChange={changeOpen}>
      <Drawer.Backdrop>
        <Drawer.Content placement={isMobile ? 'bottom' : 'right'}>
          <Drawer.Dialog className="relative overflow-visible pb-0">
            <Drawer.CloseTrigger />
            <Drawer.Header className="flex-col">
              {canNavigateDays ? (
                <div className="flex items-center gap-2">
                  <div>{getMainTitle()}</div>
                  <Tooltip closeDelay={0}>
                    <Tooltip.Trigger>
                      <CustomButton
                        size="sm"
                        isIconOnly
                        variant="ghost"
                        className="rounded-sm"
                        aria-label="Previous day"
                        onPress={() => {
                          navigateDay(-1);
                        }}
                      >
                        <CaretLeftIcon
                          size={16}
                          focusable="false"
                          aria-hidden="true"
                        />
                      </CustomButton>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Previous day</Tooltip.Content>
                  </Tooltip>
                  <Tooltip closeDelay={0}>
                    <Tooltip.Trigger>
                      <CustomButton
                        size="sm"
                        isIconOnly
                        variant="ghost"
                        aria-label="Next day"
                        className="rounded-sm"
                        onPress={() => {
                          navigateDay(1);
                        }}
                      >
                        <CaretRightIcon
                          size={16}
                          focusable="false"
                          aria-hidden="true"
                        />
                      </CustomButton>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Next day</Tooltip.Content>
                  </Tooltip>
                </div>
              ) : (
                getMainTitle()
              )}
              {occurrencesData?.hasOccurrencesWithAndWithoutTime && (
                <p className="text-default-400 dark:text-default-600 text-xs">
                  Has occurrences with and without specific times
                </p>
              )}
            </Drawer.Header>
            <Drawer.Body className="overflow-x-visible pb-8">
              {occurrencesData && (
                <OccurrenceList
                  onRemove={dispatchOccurrenceRemoval}
                  hasChips={!!occurrencesData.dayOccurrences}
                  occurrenceIdBeingRemoved={occurrenceIdBeingRemoved}
                  occurrencesWithTime={occurrencesData.occurrencesWithTime}
                  occurrencesWithoutTime={
                    occurrencesData.occurrencesWithoutTime
                  }
                  hasOccurrencesWithTime={
                    occurrencesData.hasOccurrencesWithTime
                  }
                  hasOccurrencesWithoutTime={
                    occurrencesData.hasOccurrencesWithoutTime
                  }
                  hasOccurrencesWithAndWithoutTime={
                    occurrencesData.hasOccurrencesWithAndWithoutTime
                  }
                />
              )}
              {dayToLog && <OccurrenceCreateFormContainer />}
              {occurrenceIdToEdit && <OccurrenceUpdateFormContainer />}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default OccurrenceDrawer;
