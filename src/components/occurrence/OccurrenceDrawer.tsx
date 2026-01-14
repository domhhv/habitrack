import { Drawer, DrawerBody, DrawerHeader, DrawerContent } from '@heroui/react';
import {
  now,
  today,
  toZoned,
  isToday,
  isSameDay,
  parseAbsolute,
  ZonedDateTime,
  toCalendarDate,
  getLocalTimeZone,
  type CalendarDate,
  parseAbsoluteToLocal,
  type CalendarDateTime,
} from '@internationalized/date';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import { useScreenWidth } from '@hooks';
import { type Occurrence } from '@models';
import {
  useOccurrences,
  useOccurrenceActions,
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
    if (!dayToDisplay && !habitIdToDisplay) {
      return null;
    }

    const filteredOccurrences = occurrences.filter((o) => {
      const occurrenceDate = toCalendarDate(
        parseAbsolute(new Date(o.timestamp).toISOString(), timeZone)
      );

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

  const dispatchOccurrenceRemoval = (occurrence: Occurrence) => {
    void handleAsyncAction(removeOccurrence(occurrence), 'remove_occurrence');
  };

  const changeOpen = (isOpen: boolean) => {
    if (!isOpen) {
      closeOccurrenceDrawer();
    }
  };

  const existingOccurrenceDateTime = React.useMemo(() => {
    if (!occurrenceToEdit?.timestamp) {
      return null;
    }

    return parseAbsoluteToLocal(
      new Date(occurrenceToEdit.timestamp).toISOString()
    );
  }, [occurrenceToEdit]);

  const formatDate = (
    date: CalendarDate | CalendarDateTime | ZonedDateTime | null
  ) => {
    const asZoned =
      date == null
        ? null
        : date instanceof ZonedDateTime
          ? date
          : toZoned(date, timeZone);

    if (!asZoned || isToday(asZoned, timeZone)) {
      return 'today';
    }

    if (isSameDay(asZoned, now(timeZone).subtract({ days: 1 }))) {
      return 'yesterday';
    }

    return dateFormatter.format(asZoned.toDate());
  };

  const getMainTitle = () => {
    if (dayToLog || occurrenceToEdit) {
      return (
        <>
          {occurrenceToEdit ? 'Edit' : 'Add'} habit entry for{' '}
          {formatDate(dayToLog || existingOccurrenceDateTime)}
        </>
      );
    }

    if (!occurrencesData) {
      return null;
    }

    if (occurrencesData.habitOccurrences?.length) {
      const [{ habit, timestamp }] = occurrencesData.habitOccurrences;

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
            {habit.name} | {dateFormatter.format(new Date(timestamp))}
          </p>
        </div>
      );
    }

    if (occurrencesData.dayOccurrences?.length) {
      const [{ timestamp }] = occurrencesData.dayOccurrences;

      return (
        <div className="flex items-center gap-2">
          <p>Habits Log | {dateFormatter.format(new Date(timestamp))}</p>
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
      size={dayToLog ? 'full' : 'md'}
      placement={isMobile ? 'bottom' : 'right'}
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
          {(dayToLog || occurrenceToEdit) && (
            <OccurrenceForm
              formatDate={formatDate}
              existingOccurrenceDateTime={existingOccurrenceDateTime}
            />
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default OccurrenceDrawer;
