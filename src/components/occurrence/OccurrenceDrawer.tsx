import { Drawer, DrawerBody, DrawerHeader, DrawerContent } from '@heroui/react';
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
import React from 'react';
import { useDateFormatter } from 'react-aria';

import { useScreenWidth } from '@hooks';
import { type Occurrence } from '@models';
import {
  useOccurrences,
  useOccurrenceActions,
  useConfirmationActions,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrenceChip from './OccurrenceChip';
import OccurrenceForm from './OccurrenceForm';
import OccurrenceList from './OccurrenceList';

const OccurrenceDrawer = () => {
  const timeZone = getLocalTimeZone();
  const occurrences = useOccurrences();
  const [occurrenceIdBeingRemoved, setOccurrenceIdBeingRemoved] =
    React.useState('');
  const { askConfirmation } = useConfirmationActions();
  const { removeOccurrence } = useOccurrenceActions();
  const { isMobile } = useScreenWidth();
  const { dayToDisplay, dayToLog, habitIdToDisplay, isOpen, occurrenceToEdit } =
    useOccurrenceDrawerState();
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
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
    if (await askConfirmation()) {
      setOccurrenceIdBeingRemoved(occurrence.id);
      handleAsyncAction(
        removeOccurrence(occurrence),
        'remove_occurrence'
      ).finally(() => {
        setOccurrenceIdBeingRemoved('');
      });
    }
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

  const getMainTitle = () => {
    if (dayToLog || occurrenceToEdit) {
      return (
        <>
          {occurrenceToEdit ? 'Edit' : 'Add'} habit entry for{' '}
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
    <Drawer
      isOpen={isOpen}
      onOpenChange={changeOpen}
      placement={isMobile ? 'bottom' : 'right'}
      size={dayToLog && isMobile ? 'full' : 'md'}
    >
      <DrawerContent>
        <DrawerHeader className="flex-col">
          {getMainTitle()}
          {occurrencesData?.hasOccurrencesWithAndWithoutTime && (
            <p className="text-default-400 dark:text-default-600 text-xs">
              Has occurrences with and without specific times
            </p>
          )}
        </DrawerHeader>
        <DrawerBody>
          {occurrencesData && (
            <OccurrenceList
              onRemove={dispatchOccurrenceRemoval}
              hasChips={!!occurrencesData.dayOccurrences}
              occurrenceIdBeingRemoved={occurrenceIdBeingRemoved}
              occurrencesWithTime={occurrencesData.occurrencesWithTime}
              occurrencesWithoutTime={occurrencesData.occurrencesWithoutTime}
              hasOccurrencesWithTime={occurrencesData.hasOccurrencesWithTime}
              hasOccurrencesWithoutTime={
                occurrencesData.hasOccurrencesWithoutTime
              }
              hasOccurrencesWithAndWithoutTime={
                occurrencesData.hasOccurrencesWithAndWithoutTime
              }
            />
          )}
          {(dayToLog || occurrenceToEdit) && <OccurrenceForm />}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default OccurrenceDrawer;
