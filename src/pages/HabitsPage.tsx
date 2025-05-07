import {
  cn,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  useDisclosure,
} from '@heroui/react';
import { Plus, TrashSimple, PencilSimple } from '@phosphor-icons/react';
import { format } from 'date-fns';
import React from 'react';

import {
  TraitChip,
  HabitIcon,
  ConfirmDialog,
  HabitLastEntry,
  EditHabitDialog,
  HabitLongestStreak,
  HabitsTotalEntries,
  AddHabitDialogButton,
} from '@components';
import { handleAsyncAction } from '@helpers';
import { useUser, useScreenWidth } from '@hooks';
import { type Habit, StorageBuckets } from '@models';
import { listFiles, deleteFile } from '@services';
import { useHabits, useHabitActions } from '@stores';

type Column = {
  align?: 'start' | 'center' | 'end';
  key: string;
  label: string;
};

const habitColumns: Column[] = [
  {
    key: 'icon',
    label: 'Icon',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'trait',
    label: 'Trait',
  },
  {
    key: 'tracking-since',
    label: 'Tracking since',
  },
  {
    key: 'last-entry',
    label: 'Last entry',
  },
  {
    key: 'longest-streak',
    label: 'Longest streak',
  },
  {
    align: 'center',
    key: 'total-entries',
    label: 'Total entries',
  },
  {
    align: 'end',
    key: 'actions',
    label: 'Actions',
  },
];

const HabitsPage = () => {
  const { user } = useUser();
  const { removeHabit } = useHabitActions();
  const habits = useHabits();
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [habitToRemove, setHabitToRemove] = React.useState<Habit | null>(null);
  const [isRemoving, setIsRemoving] = React.useState<boolean>(false);
  const [isAddDialogAnimatingClose, setIsAddDialogAnimatingClose] =
    React.useState<boolean>(false);
  const { isMobile } = useScreenWidth();
  const {
    isOpen: isAddDialogOpen,
    onClose: closeAddDialog,
    onOpen: openAddDialog,
  } = useDisclosure();

  const handleRemovalStart = (habit: Habit) => {
    setHabitToRemove(habit);
  };

  const handleRemovalConfirmed = async () => {
    if (!habitToRemove || !user) {
      return null;
    }

    const remove = async () => {
      const habitOccurrencePhotos = await listFiles(
        StorageBuckets.OCCURRENCE_PHOTOS,
        `${user.id}/${habitToRemove.id}/`
      );

      if (habitOccurrencePhotos.length > 0) {
        await Promise.all(
          habitOccurrencePhotos.map((photo) => {
            return deleteFile(
              StorageBuckets.OCCURRENCE_PHOTOS,
              `${user.id}/${habitToRemove.id}/${photo.name}`
            );
          })
        );
      }

      return removeHabit(habitToRemove);
    };

    void handleAsyncAction(remove(), 'remove_habit', setIsRemoving).then(
      handleRemovalEnd
    );
  };

  const handleRemovalEnd = () => {
    setHabitToRemove(null);
  };

  const handleEditStart = (habit: Habit) => {
    setHabitToEdit(habit);
  };

  const handleEditEnd = () => {
    setHabitToEdit(null);
  };

  return (
    <>
      <title>My Habits | Habitrack</title>
      <h1 className="mx-auto mb-4 mt-8 text-3xl font-bold text-gray-800 dark:text-gray-300">
        Your habits
      </h1>
      <Table
        shadow="none"
        isHeaderSticky
        aria-label="Habits tracking table"
        classNames={{
          base: cn(
            'overflow-scroll scrollbar-hide px-8 py-2 lg:px-16 lg:py-4 [&>div]:bg-white [&>div]:dark:bg-background-800',
            isMobile ? 'max-h-[400px]' : 'max-h-[600px]'
          ),
        }}
      >
        <TableHeader columns={habitColumns}>
          {(column) => {
            return (
              <TableColumn
                key={column.key}
                aria-label={column.label}
                align={column.align || 'start'}
              >
                {column.label}
              </TableColumn>
            );
          }}
        </TableHeader>
        <TableBody aria-label="Habits data" emptyContent="No habits yet">
          {habits.map((habit) => {
            return (
              <TableRow
                key={habit.id}
                aria-labelledby={`habit-name-${habit.id}`}
              >
                <TableCell className="w-10">
                  <HabitIcon habit={habit} />
                </TableCell>
                <TableCell>
                  <h6 className="font-semibold" id={`habit-name-${habit.id}`}>
                    {habit.name}
                  </h6>
                  {habit.description && (
                    <p className="text-left text-xs">
                      <i>{habit.description}</i>
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <TraitChip trait={habit.trait} />
                </TableCell>
                <TableCell>
                  {format(
                    habit.createdAt,
                    isMobile ? 'MMM d, y' : 'LLLL do, y'
                  )}
                </TableCell>
                <TableCell>
                  <HabitLastEntry id={habit.id} />
                </TableCell>
                <TableCell>
                  <HabitLongestStreak id={habit.id} />
                </TableCell>
                <TableCell
                  align="center"
                  aria-label={`Total entries for ${habit.name}`}
                >
                  <HabitsTotalEntries id={habit.id} />
                </TableCell>
                <TableCell aria-label="Actions">
                  <div
                    role="group"
                    className="flex justify-end gap-2"
                    aria-label={`Actions for habit ${habit.name}`}
                  >
                    <Tooltip
                      role="tooltip"
                      content="Edit habit"
                      id={`edit-tooltip-${habit.id}`}
                    >
                      <Button
                        size="sm"
                        isIconOnly
                        variant="ghost"
                        color="secondary"
                        role="edit-habit-button"
                        aria-label={`Edit habit: ${habit.name}`}
                        aria-describedby={`edit-tooltip-${habit.id}`}
                        data-testid={`edit-habit-id-${habit.id}-button`}
                        onPress={() => {
                          return handleEditStart(habit);
                        }}
                      >
                        <PencilSimple
                          size={16}
                          weight="bold"
                          aria-hidden="true"
                        />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      color="danger"
                      role="tooltip"
                      content="Delete habit"
                      id={`delete-tooltip-${habit.id}`}
                    >
                      <Button
                        size="sm"
                        isIconOnly
                        color="danger"
                        variant="ghost"
                        className="group"
                        isDisabled={!user?.id}
                        role="delete-habit-button"
                        aria-label={`Delete habit: ${habit.name}`}
                        aria-describedby={`delete-tooltip-${habit.id}`}
                        data-testid={`delete-habit-id-${habit.id}-button`}
                        onPress={() => {
                          return handleRemovalStart(habit);
                        }}
                      >
                        <TrashSimple
                          size={16}
                          weight="bold"
                          aria-hidden="true"
                        />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <EditHabitDialog habit={habitToEdit} onClose={handleEditEnd} />
      <div className="m-auto my-4 flex w-full justify-end px-4 lg:px-16 lg:py-4">
        <Button
          color="primary"
          variant="solid"
          isDisabled={!user}
          onPress={openAddDialog}
          className="w-full lg:w-auto"
          data-testid="add-habit-button"
          startContent={<Plus weight="bold" />}
        >
          Add habit
        </Button>
        {(isAddDialogOpen || isAddDialogAnimatingClose) && (
          <AddHabitDialogButton
            isOpen={isAddDialogOpen}
            onClose={() => {
              setIsAddDialogAnimatingClose(true);
              closeAddDialog();
              setTimeout(() => {
                setIsAddDialogAnimatingClose(false);
              }, 100);
            }}
          />
        )}
      </div>
      <ConfirmDialog
        isLoading={isRemoving}
        heading="Delete habit"
        isOpen={!!habitToRemove}
        onCancel={handleRemovalEnd}
        onConfirm={handleRemovalConfirmed}
      >
        <div>
          Are you sure you want to delete <strong>{habitToRemove?.name}</strong>{' '}
          habit?
          <br />
          <br />
          <i className="text-sm">
            This action deletes all related calendar entries and can&apos;t be
            undone
          </i>
        </div>
      </ConfirmDialog>
    </>
  );
};

export default HabitsPage;
