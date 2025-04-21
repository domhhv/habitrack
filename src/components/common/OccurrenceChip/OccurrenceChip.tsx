import { OccurrenceDialog } from '@components';
import {
  addToast,
  Badge,
  Button,
  cn,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { Camera, Note, PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { useOccurrenceActions } from '@stores';
import { getErrorMessage, getHabitIconUrl } from '@utils';
import { format } from 'date-fns';
import React from 'react';

export type OccurrenceChipProps = {
  isInteractable?: boolean;
  occurrences: Occurrence[];
  colorOverride?: string;
};

const OccurrenceChip = ({
  isInteractable = true,
  occurrences,
  colorOverride,
}: OccurrenceChipProps) => {
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
    onOpenChange: onDrawerOpenChange,
  } = useDisclosure();
  const {
    isOpen: isOccurrenceDialogOpen,
    onOpen: openOccurrenceDialog,
    onClose: closeOccurrenceDialog,
  } = useDisclosure();
  const [occurrenceToEdit, setOccurrenceToEdit] =
    React.useState<Occurrence | null>(null);
  const [occurrence] = occurrences;
  const { habit } = occurrence;
  const { name: habitName, iconPath, trait } = habit || {};
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

  const handleRemoveOccurrence = async (id: number) => {
    try {
      await removeOccurrence(id);
      addToast({
        title: 'Your habit entry has been deleted from the calendar.',
        color: 'success',
      });
    } catch (error) {
      console.error('Error removing occurrence:', error);
      addToast({
        title:
          'Something went wrong while deleting your habit entry. Please try again.',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    }
  };

  let chip = (
    <Tooltip
      content={habitName}
      radius="sm"
      classNames={{
        content: 'px-2 py-1.5',
      }}
      delay={0}
      closeDelay={100}
    >
      <div
        role="button"
        style={{ borderColor: colorOverride || traitColor }}
        onClick={openDrawer}
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
        content={occurrences.length}
        variant="solid"
        placement="bottom-right"
        color="primary"
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
        content={<Note weight="fill" size={14} />}
        placement="top-right"
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
      return o.photoPaths;
    })
  ) {
    chip = (
      <Badge
        size="sm"
        content={<Camera weight="fill" size={14} />}
        placement="top-left"
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
        existingOccurrence={occurrenceToEdit}
        onClose={handleOccurrenceModalClose}
      />

      <Drawer
        placement="bottom"
        isOpen={isDrawerOpen && isInteractable}
        onOpenChange={onDrawerOpenChange}
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
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="secondary"
                            onPress={() => {
                              return handleOccurrenceModalOpen(o);
                            }}
                            className="h-6 w-6 min-w-0 rounded-lg"
                          >
                            <PencilSimple
                              size={14}
                              fill="bold"
                              className="dark:fill-white"
                            />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            onPress={() => {
                              return handleRemoveOccurrence(o.id);
                            }}
                            role="habit-chip-delete-button"
                            className="h-6 w-6 min-w-0 rounded-lg"
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
            <Button variant="light" color="danger" onPress={closeDrawer}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OccurrenceChip;
