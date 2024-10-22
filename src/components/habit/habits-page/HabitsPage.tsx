import {
  AddHabitDialogButton,
  ConfirmDialog,
  EditHabitDialog,
} from '@components';
import { useHabits, useOccurrences } from '@context';
import { useDocumentTitle } from '@hooks';
import { type Habit } from '@models';
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react';
import { PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React from 'react';

import HabitIconCell from './HabitIconCell';
import HabitLastEntryCell from './HabitLastEntryCell';
import HabitLongestStreakCell from './HabitLongestStreakCell';
import HabitsTotalEntriesCell from './HabitsTotalEntriesCell';

const habitColumns = [
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
  },
  {
    key: 'actions',
    label: 'Actions',
  },
];

const HabitsPage = () => {
  const user = useUser();
  const { habits, removeHabit, habitIdBeingDeleted } = useHabits();
  const { removeOccurrencesByHabitId } = useOccurrences();
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [habitToRemove, setHabitToRemove] = React.useState<Habit | null>(null);

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
    removeOccurrencesByHabitId(habitToRemove.id);
    setHabitToRemove(null);
  };

  const handleEditStart = (habit: Habit) => {
    setHabitToEdit(habit);
  };

  const handleEditEnd = () => {
    setHabitToEdit(null);
  };

  return (
    <div className="mx-auto mt-16 flex flex-col gap-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300">
        Your habits
      </h1>
      <Table>
        <TableHeader columns={habitColumns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent="No habits yet"
          items={habits.map(({ id, ...habit }) => ({ ...habit, key: id }))}
        >
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
                <Chip size="sm" variant="faded" className="ml-2 h-5 border-1">
                  <div className="flex items-center gap-1">
                    <span
                      className="mr-0.5 inline-block h-1 w-1 rounded-full"
                      role="habit-trait-chip-color-indicator"
                      style={{
                        backgroundColor: habit.trait?.color || 'black',
                      }}
                    />
                    <p role="habit-trait-chip-name">
                      {habit.trait?.name || 'Unknown trait'}
                    </p>
                  </div>
                </Chip>
              </TableCell>
              <TableCell>{format(habit.createdAt, 'LLLL do, y')}</TableCell>
              <TableCell>
                <HabitLastEntryCell id={habit.id} />
              </TableCell>
              <TableCell>
                <HabitLongestStreakCell id={habit.id} />
              </TableCell>
              <TableCell>
                <HabitsTotalEntriesCell id={habit.id} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Edit habit">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      color="primary"
                      onClick={() => handleEditStart(habit)}
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
                      onClick={() => handleRemovalConfirmOpen(habit)}
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
      <EditHabitDialog
        open={!!habitToEdit}
        onClose={handleEditEnd}
        habit={habitToEdit}
      />
      <AddHabitDialogButton />
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
    </div>
  );
};

export default HabitsPage;
