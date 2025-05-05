import {
  cn,
  Badge,
  Button,
  Drawer,
  Tooltip,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  useDisclosure,
} from '@heroui/react';
import { Note, Camera, TrashSimple, PencilSimple } from '@phosphor-icons/react';
import { format } from 'date-fns';
import React from 'react';

import { OccurrenceDialog } from '@components';
import { handleAsyncAction } from '@helpers';
import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { useOccurrenceActions } from '@stores';
import { getHabitIconUrl } from '@utils';

export type OccurrenceChipProps = {
  colorOverride?: string;
  isInteractable?: boolean;
  occurrences: Occurrence[];
};

const OccurrenceChip = ({
  colorOverride,
  isInteractable = true,
  occurrences,
}: OccurrenceChipProps) => {
  const {
    isOpen: isDrawerOpen,
    onClose: closeDrawer,
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
  const iconUrl = getHabitIconUrl(iconPath);
  const { screenWidth } = useScreenWidth();
  const { removeOccurrence } = useOccurrenceActions();

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
      delay={0}
      radius="sm"
      closeDelay={100}
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
          'relative mb-0 min-w-8 rounded-md border-2 bg-slate-100 p-1.5 dark:bg-slate-800 md:mb-1 md:mr-1',
          screenWidth < 400 && 'p-1',
          isDrawerOpen && !isOccurrenceDialogOpen && 'z-[51]'
        )}
      >
        <img
          src={iconUrl}
          alt={`${habitName} icon`}
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
        className={cn(isDrawerOpen && !isOccurrenceDialogOpen && 'z-[51]')}
      >
        {chip}
      </Badge>
    );
  }

  if (
    occurrences.some((o) => {
      return o.notes[0];
    })
  ) {
    chip = (
      <Badge
        size="sm"
        placement="top-right"
        content={<Note size={14} weight="fill" />}
        className={cn(
          'right-1 top-1 border-none bg-transparent',
          isDrawerOpen && !isOccurrenceDialogOpen && 'z-[51]'
        )}
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
        content={<Camera size={14} weight="fill" />}
        className={cn(
          'right-1 top-1 border-none bg-transparent',
          isDrawerOpen && !isOccurrenceDialogOpen && 'z-[51]'
        )}
      >
        {chip}
      </Badge>
    );
  }

  return (
    <>
      {chip}

      <OccurrenceDialog
        isOpen={isOccurrenceDialogOpen}
        onClose={handleOccurrenceModalClose}
        existingOccurrence={occurrenceToEdit}
      />

      <Drawer
        placement="bottom"
        onOpenChange={onDrawerOpenChange}
        isOpen={isDrawerOpen && isInteractable}
      >
        <DrawerContent>
          <DrawerHeader>{habitName}</DrawerHeader>
          <DrawerBody>
            <div className="max-h-96 space-y-2 overflow-x-hidden overflow-y-visible p-1">
              <span className="font-bold">{habitName}</span>
              <ul className="space-y-2 italic">
                {occurrences
                  .toSorted((a, b) => {
                    return a.timestamp - b.timestamp;
                  })
                  .map((o) => {
                    return (
                      <li
                        key={o.id}
                        className="mb-2 flex items-start justify-between gap-4 border-b border-neutral-500 py-2"
                      >
                        <div className="max-w-48">
                          <span className="font-semibold">
                            {format(new Date(o.timestamp), 'p')}
                          </span>
                          {!!o.notes[0] && (
                            <span className="font-normal">
                              : {o.notes[0].content}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            color="secondary"
                            className="h-6 w-6 min-w-0 rounded-lg"
                            onPress={() => {
                              return handleOccurrenceModalOpen(o);
                            }}
                          >
                            <PencilSimple
                              size={14}
                              fill="bold"
                              className="dark:fill-white"
                            />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            role="habit-chip-delete-button"
                            className="h-6 w-6 min-w-0 rounded-lg"
                            onPress={() => {
                              return handleRemoveOccurrence(o);
                            }}
                          >
                            <TrashSimple
                              size={14}
                              fill="bold"
                              className="dark:fill-white"
                            />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button color="danger" variant="light" onPress={closeDrawer}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OccurrenceChip;
