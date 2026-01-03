import {
  cn,
  Badge,
  Drawer,
  Tooltip,
  DrawerBody,
  DrawerHeader,
  ScrollShadow,
  DrawerContent,
  useDisclosure,
} from '@heroui/react';
import { NoteIcon, CameraIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import { OccurrenceDialog } from '@components';
import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useOccurrenceActions } from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrenceListItem from './OccurrenceListItem';

export type OccurrenceChipProps = {
  colorOverride?: string;
  isInteractable?: boolean;
  occurrences: Occurrence[];
  timeZone?: string;
};

const OccurrenceChip = ({
  colorOverride,
  isInteractable = true,
  occurrences,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: OccurrenceChipProps) => {
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onOpenChange: onDrawerOpenChange,
  } = useDisclosure();
  const {
    isOpen: isOccurrenceDialogOpen,
    onClose: closeOccurrenceDialog,
    onOpen: openOccurrenceDialog,
  } = useDisclosure();
  const [occurrenceToEdit, setOccurrenceToEdit] =
    React.useState<Occurrence | null>(null);
  const [occurrence] = occurrences;
  const { habit } = occurrence;
  const { iconPath, name: habitName, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const { screenWidth } = useScreenWidth();
  const { removeOccurrence } = useOccurrenceActions();
  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone,
    year: 'numeric',
  });

  const handleOccurrenceModalClose = () => {
    setOccurrenceToEdit(null);
    closeOccurrenceDialog();
  };

  const handleOccurrenceModalOpen = (occurrence: Occurrence) => {
    setOccurrenceToEdit(occurrence);
    openOccurrenceDialog();
  };

  const handleRemoveOccurrence = async (occurrence: Occurrence) => {
    handleAsyncAction(removeOccurrence(occurrence), 'remove_occurrence');
  };

  let chip = (
    <Tooltip
      radius="sm"
      closeDelay={0}
      content={habitName}
      classNames={{
        content: 'px-2 py-1.5',
      }}
    >
      <div
        role="button"
        onClick={openDrawer}
        style={{ borderColor: colorOverride || traitColor }}
        className={cn(
          'relative mb-0 min-w-8 rounded-md border-2 bg-slate-100 p-1.5 md:mr-1 md:mb-1 dark:bg-slate-800',
          screenWidth < 400 && 'p-1'
        )}
      >
        <img
          alt={`${habitName} icon`}
          src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
          className={cn('h-4 w-4', screenWidth < 400 && 'h-3 w-3')}
        />
      </div>
    </Tooltip>
  );

  if (occurrences.length > 1) {
    chip = (
      <Badge
        size="sm"
        variant="solid"
        color="primary"
        placement="bottom-right"
        content={occurrences.length}
      >
        {chip}
      </Badge>
    );
  }

  if (
    occurrences.some((o) => {
      return o.note;
    })
  ) {
    chip = (
      <Badge
        size="sm"
        placement="top-right"
        content={<NoteIcon size={14} weight="fill" />}
        className="top-1 right-1 border-none bg-transparent"
      >
        {chip}
      </Badge>
    );
  }

  if (
    occurrences.some((o) => {
      return o.photoPaths?.length;
    })
  ) {
    chip = (
      <Badge
        size="sm"
        placement="top-left"
        content={<CameraIcon size={14} weight="fill" />}
        className="top-1 right-1 border-none bg-transparent"
      >
        {chip}
      </Badge>
    );
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

  return (
    <>
      {chip}

      {occurrenceToEdit && (
        <OccurrenceDialog
          timeZone={timeZone}
          isOpen={isOccurrenceDialogOpen}
          onClose={handleOccurrenceModalClose}
          existingOccurrence={occurrenceToEdit}
        />
      )}

      <Drawer
        onOpenChange={onDrawerOpenChange}
        isOpen={isDrawerOpen && isInteractable}
      >
        <DrawerContent>
          <DrawerHeader className="flex-col">
            <p>
              {habitName} |{' '}
              {dateFormatter.format(new Date(occurrence.timestamp))}
            </p>
            {hasOccurrencesWithAndWithoutTime && (
              <p className="text-default-400 dark:text-default-600 text-xs">
                Has occurrences with and without specific times
              </p>
            )}
          </DrawerHeader>
          <DrawerBody>
            <ScrollShadow
              className={cn(
                'max-h-full',
                hasOccurrencesWithAndWithoutTime && 'space-y-4'
              )}
            >
              {hasOccurrencesWithoutTime && (
                <div>
                  {hasOccurrencesWithAndWithoutTime && (
                    <p className="mb-1">Without time</p>
                  )}
                  <ul>
                    {occurrencesWithoutTime.map((o) => {
                      return (
                        <OccurrenceListItem
                          key={o.id}
                          occurrence={o}
                          onRemove={() => {
                            handleRemoveOccurrence(o);
                          }}
                          onEdit={() => {
                            handleOccurrenceModalOpen(o);
                          }}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
              {hasOccurrencesWithTime && (
                <div>
                  {hasOccurrencesWithAndWithoutTime && (
                    <p className="mb-1">With time</p>
                  )}
                  <ul>
                    {occurrencesWithTime
                      .toSorted((a, b) => {
                        return a.timestamp - b.timestamp;
                      })
                      .map((o) => {
                        return (
                          <OccurrenceListItem
                            key={o.id}
                            occurrence={o}
                            onRemove={() => {
                              handleRemoveOccurrence(o);
                            }}
                            onEdit={() => {
                              handleOccurrenceModalOpen(o);
                            }}
                          />
                        );
                      })}
                  </ul>
                </div>
              )}
            </ScrollShadow>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OccurrenceChip;
