import {
  AddHabitDialogButton,
  ConfirmDialog,
  EditHabitDialog,
  TraitChip,
} from '@components';
import { handleAsyncAction } from '@helpers';
import {
  Button,
  cn,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@heroui/react';
import { useScreenWidth, useUser } from '@hooks';
import { type Habit } from '@models';
import { PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { useHabitActions, useHabits } from '@stores';
import { format } from 'date-fns';
import React from 'react';

import HabitIconCell from './HabitIconCell';
import HabitLastEntryCell from './HabitLastEntryCell';
import HabitLongestStreakCell from './HabitLongestStreakCell';
import HabitsTotalEntriesCell from './HabitsTotalEntriesCell';

type Column = {
  key: string;
  label: string;
  align?: 'start' | 'center' | 'end';
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
    key: 'total-entries',
    label: 'Total entries',
    align: 'center',
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'end',
  },
];

const HabitsPage = () => {
  const { user } = useUser();
  const { removeHabit } = useHabitActions();
  const habits = useHabits();
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [habitToRemove, setHabitToRemove] = React.useState<Habit | null>(null);
  const [isRemoving, setIsRemoving] = React.useState<boolean>(false);
  const { isMobile } = useScreenWidth();

  const handleRemovalConfirmOpen = (habit: Habit) => {
    setHabitToRemove(habit);
  };

  const handleRemovalCancel = () => {
    setHabitToRemove(null);
  };

  const handleRemovalConfirmed = async () => {
    if (!habitToRemove) {
      return null;
    }

    void handleAsyncAction(
      removeHabit(habitToRemove),
      'remove_habit',
      setIsRemoving
    );
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
                align={column.align || 'start'}
                aria-label={column.label}
              >
                {column.label}
              </TableColumn>
            );
          }}
        </TableHeader>
        <TableBody emptyContent="No habits yet" aria-label="Habits data">
          {habits.map((habit) => {
            return (
              <TableRow
                key={habit.id}
                aria-labelledby={`habit-name-${habit.id}`}
              >
                <TableCell>
                  <HabitIconCell habit={habit} />
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
                  <HabitLastEntryCell id={habit.id} />
                </TableCell>
                <TableCell>
                  <HabitLongestStreakCell id={habit.id} />
                </TableCell>
                <TableCell
                  align="center"
                  aria-label={`Total entries for ${habit.name}`}
                >
                  <HabitsTotalEntriesCell id={habit.id} />
                </TableCell>
                <TableCell aria-label="Actions">
                  <div
                    className="flex justify-end gap-2"
                    role="group"
                    aria-label={`Actions for habit ${habit.name}`}
                  >
                    <Tooltip
                      content="Edit habit"
                      id={`edit-tooltip-${habit.id}`}
                      role="tooltip"
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        color="secondary"
                        aria-label={`Edit habit: ${habit.name}`}
                        aria-describedby={`edit-tooltip-${habit.id}`}
                        onPress={() => {
                          return handleEditStart(habit);
                        }}
                        role="edit-habit-button"
                        data-testid={`edit-habit-id-${habit.id}-button`}
                      >
                        <PencilSimple
                          weight="bold"
                          size={16}
                          aria-hidden="true"
                        />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content="Delete habit"
                      color="danger"
                      id={`delete-tooltip-${habit.id}`}
                      role="tooltip"
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="ghost"
                        aria-label={`Delete habit: ${habit.name}`}
                        aria-describedby={`delete-tooltip-${habit.id}`}
                        onPress={() => {
                          return handleRemovalConfirmOpen(habit);
                        }}
                        isDisabled={!user?.id}
                        role="delete-habit-button"
                        data-testid={`delete-habit-id-${habit.id}-button`}
                        className="group"
                      >
                        <TrashSimple
                          weight="bold"
                          size={16}
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
      <EditHabitDialog onClose={handleEditEnd} habit={habitToEdit} />
      <div className="m-auto my-4 flex w-full justify-end px-4 lg:px-16 lg:py-4">
        <AddHabitDialogButton />
      </div>
      <ConfirmDialog
        open={!!habitToRemove}
        heading="Delete habit"
        onConfirm={handleRemovalConfirmed}
        onCancel={handleRemovalCancel}
        loading={isRemoving}
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
