import {
  AddHabitDialogButton,
  ConfirmDialog,
  EditHabitDialog,
  TraitChip,
} from '@components';
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
import { useDocumentTitle, useScreenWidth, useUser } from '@hooks';
import { type Habit } from '@models';
import { PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { useHabitsStore, useOccurrencesStore } from '@stores';
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
  const { habits, removeHabit, habitIdBeingDeleted } = useHabitsStore();
  const { removeOccurrencesByHabitIdFromState } = useOccurrencesStore();
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [habitToRemove, setHabitToRemove] = React.useState<Habit | null>(null);
  const { isMobile } = useScreenWidth();

  useDocumentTitle('My Habits | Habitrack');

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

    await removeHabit(habitToRemove);
    removeOccurrencesByHabitIdFromState(habitToRemove.id);
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
      <h1 className="mx-auto mb-4 mt-8 text-3xl font-bold text-gray-800 dark:text-gray-300">
        Your habits
      </h1>
      <Table
        shadow="none"
        isHeaderSticky
        classNames={{
          base: cn(
            'overflow-scroll px-8 py-2 lg:px-16 lg:py-4 [&>div]:bg-white [&>div]:dark:bg-background-800',
            isMobile ? 'max-h-[400px]' : 'max-h-[600px]'
          ),
        }}
      >
        <TableHeader columns={habitColumns}>
          {(column) => (
            <TableColumn key={column.key} align={column.align || 'start'}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="No habits yet">
          {habits.map((habit) => (
            <TableRow key={habit.id}>
              <TableCell>
                <HabitIconCell habit={habit} />
              </TableCell>
              <TableCell>
                <h6 className="font-semibold">{habit.name}</h6>
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
                {format(habit.createdAt, isMobile ? 'MMM d, y' : 'LLLL do, y')}
              </TableCell>
              <TableCell>
                <HabitLastEntryCell id={habit.id} />
              </TableCell>
              <TableCell>
                <HabitLongestStreakCell id={habit.id} />
              </TableCell>
              <TableCell align="center">
                <HabitsTotalEntriesCell id={habit.id} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Tooltip content="Edit habit">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      color="secondary"
                      onPress={() => handleEditStart(habit)}
                      role="edit-habit-button"
                      data-testid={`edit-habit-id-${habit.id}-button`}
                    >
                      <PencilSimple weight="bold" size={16} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete habit" color="danger">
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="bordered"
                      onPress={() => handleRemovalConfirmOpen(habit)}
                      isDisabled={!user?.id}
                      role="delete-habit-button"
                      data-testid={`delete-habit-id-${habit.id}-button`}
                      className="group"
                    >
                      <TrashSimple weight="bold" size={16} />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
        loading={habitIdBeingDeleted === habitToRemove?.id}
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
