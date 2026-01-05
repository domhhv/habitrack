import {
  cn,
  Drawer,
  DrawerBody,
  DrawerHeader,
  ScrollShadow,
  DrawerContent,
} from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import { useScreenWidth } from '@hooks';
import { StorageBuckets, type Occurrence } from '@models';
import { getPublicUrl } from '@services';
import {
  useOccurrenceActions,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import { OccurrenceDialog } from './index';
import OccurrenceListItem from './OccurrenceListItem';

const OccurrenceDrawer = () => {
  const timeZone = getLocalTimeZone();
  const [isOccurrenceDialogOpen, setIsOccurrenceDialogOpen] =
    React.useState(false);
  const [occurrenceToEdit, setOccurrenceToEdit] =
    React.useState<Occurrence | null>(null);
  const { removeOccurrence } = useOccurrenceActions();
  const { isMobile } = useScreenWidth();
  const { dayOccurrences, habitOccurrences, isOpen } =
    useOccurrenceDrawerState();
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone,
    year: 'numeric',
  });
  const occurrencesData = React.useMemo(() => {
    const occurrences = dayOccurrences || habitOccurrences;

    if (!occurrences) {
      return null;
    }

    const occurrencesWithTime = occurrences.filter((o) => {
      return o.hasSpecificTime;
    });

    const occurrencesWithoutTime = occurrences.filter((o) => {
      return !o.hasSpecificTime;
    });

    const hasOccurrencesWithTime = !!occurrencesWithTime.length;
    const hasOccurrencesWithoutTime = !!occurrencesWithoutTime.length;

    const hasOccurrencesWithAndWithoutTime =
      hasOccurrencesWithTime && hasOccurrencesWithoutTime;

    return {
      dayOccurrences,
      habitOccurrences,
      hasOccurrencesWithAndWithoutTime,
      hasOccurrencesWithoutTime,
      hasOccurrencesWithTime,
      occurrencesWithoutTime,
      occurrencesWithTime,
    };
  }, [habitOccurrences, dayOccurrences]);

  const closeOccurrenceDialog = () => {
    setOccurrenceToEdit(null);
    setIsOccurrenceDialogOpen(false);
  };

  const openOccurrenceDialog = (occurrence: Occurrence) => {
    setOccurrenceToEdit(occurrence);
    setIsOccurrenceDialogOpen(true);
  };

  const dispatchOccurrenceRemoval = async (occurrence: Occurrence) => {
    handleAsyncAction(removeOccurrence(occurrence), 'remove_occurrence');
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
      const [
        {
          timestamp,
          habit: {
            iconPath,
            name,
            trait: { color },
          },
        },
      ] = occurrencesData.habitOccurrences;

      return (
        <div className="flex items-center gap-2">
          <div
            style={{ borderColor: color }}
            className="relative min-w-8 rounded-md border-2 bg-white p-1.5 dark:bg-black"
          >
            <img
              className="h-4 w-4"
              alt={`${name} icon`}
              src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
            />
          </div>
          <p>
            {name} | {dateFormatter.format(new Date(timestamp))}
          </p>
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

  const getBodyContent = () => {
    if (occurrencesData) {
      return (
        <ScrollShadow
          className={cn(
            'max-h-full',
            occurrencesData.hasOccurrencesWithAndWithoutTime && 'space-y-4'
          )}
        >
          {occurrencesData.hasOccurrencesWithoutTime && (
            <div>
              {occurrencesData.hasOccurrencesWithAndWithoutTime && (
                <p className="mb-1">Without time</p>
              )}
              <ol className="list-decimal pl-6">
                {occurrencesData.occurrencesWithoutTime.map((o) => {
                  return (
                    <OccurrenceListItem
                      key={o.id}
                      occurrence={o}
                      onEdit={() => {
                        openOccurrenceDialog(o);
                      }}
                      onRemove={() => {
                        void dispatchOccurrenceRemoval(o);
                      }}
                    />
                  );
                })}
              </ol>
            </div>
          )}
          {occurrencesData.hasOccurrencesWithTime && (
            <div>
              {occurrencesData.hasOccurrencesWithAndWithoutTime && (
                <p className="mb-1">With time</p>
              )}
              <ul>
                {occurrencesData.occurrencesWithTime
                  .toSorted((a, b) => {
                    return a.timestamp - b.timestamp;
                  })
                  .map((o) => {
                    return (
                      <OccurrenceListItem
                        key={o.id}
                        occurrence={o}
                        onEdit={() => {
                          openOccurrenceDialog(o);
                        }}
                        onRemove={() => {
                          void dispatchOccurrenceRemoval(o);
                        }}
                      />
                    );
                  })}
              </ul>
            </div>
          )}
        </ScrollShadow>
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
          <DrawerBody>{getBodyContent()}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OccurrenceDrawer;
