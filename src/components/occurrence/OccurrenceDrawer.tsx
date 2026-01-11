import { Drawer, DrawerBody, DrawerHeader, DrawerContent } from '@heroui/react';
import {
  today,
  isSameDay,
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
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

import { OccurrenceDialog } from './index';
import OccurrenceChip from './OccurrenceChip';
import OccurrenceList from './OccurrenceList';

const OccurrenceDrawer = () => {
  const timeZone = getLocalTimeZone();
  const occurrences = useOccurrences();
  const [isOccurrenceDialogOpen, setIsOccurrenceDialogOpen] =
    React.useState(false);
  const [occurrenceToEdit, setOccurrenceToEdit] =
    React.useState<Occurrence | null>(null);
  const { removeOccurrence } = useOccurrenceActions();
  const { isMobile } = useScreenWidth();
  const { dayToDisplay, habitIdToDisplay, isOpen } = useOccurrenceDrawerState();
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

  const closeOccurrenceDialog = () => {
    setOccurrenceToEdit(null);
    setIsOccurrenceDialogOpen(false);
  };

  const openOccurrenceDialog = (occurrence: Occurrence) => {
    setOccurrenceToEdit(occurrence);
    setIsOccurrenceDialogOpen(true);
  };

  const dispatchOccurrenceRemoval = (occurrence: Occurrence) => {
    void handleAsyncAction(removeOccurrence(occurrence), 'remove_occurrence');
  };

  const changeOpen = (isOpen: boolean) => {
    if (!isOpen) {
      closeOccurrenceDrawer();
    }
  };

  const getMainTitle = () => {
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
  };

  const getHeaderContent = () => {
    if (occurrencesData) {
      return (
        <>
          {getMainTitle()}
          {occurrencesData.hasOccurrencesWithAndWithoutTime && (
            <p className="text-default-400 dark:text-default-600 text-xs">
              Has occurrences with and without specific times
            </p>
          )}
        </>
      );
    }
  };

  return (
    <>
      {occurrenceToEdit && (
        <OccurrenceDialog
          timeZone={timeZone}
          isOpen={isOccurrenceDialogOpen}
          onClose={closeOccurrenceDialog}
          existingOccurrence={occurrenceToEdit}
        />
      )}

      <Drawer
        isOpen={isOpen}
        onOpenChange={changeOpen}
        placement={isMobile ? 'bottom' : 'right'}
      >
        <DrawerContent>
          <DrawerHeader className="flex-col">{getHeaderContent()}</DrawerHeader>
          <DrawerBody>
            {occurrencesData && (
              <OccurrenceList
                onEdit={openOccurrenceDialog}
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OccurrenceDrawer;
