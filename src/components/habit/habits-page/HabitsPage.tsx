import {
  AddHabitDialogButton,
  ConfirmDialog,
  EditHabitDialog,
} from '@components';
import { useHabits, useOccurrences, useTraits } from '@context';
import { useDocumentTitle } from '@hooks';
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
  const { traitsMap } = useTraits();
  const { habits, habitsMap, removeHabit } = useHabits();
  const { removeOccurrencesByHabitId } = useOccurrences();
  const [isEditingHabit, setIsEditingHabit] = React.useState(false);
  const [habitIdToEdit, setHabitIdToEdit] = React.useState(0);
  const [habitIdToRemove, setHabitIdToRemove] = React.useState(0);
  const [isRemovingHabit, setIsRemovingHabit] = React.useState(false);

  useDocumentTitle('My Habits | Habitrack');

  const handleRemovalConfirmOpen = (id: number) => {
    setHabitIdToRemove(id);
  };

  const handleRemovalCancel = () => {
    setHabitIdToRemove(0);
  };

  const handleRemovalConfirmed = async () => {
    setIsRemovingHabit(true);
    await removeHabit(habitIdToRemove);
    removeOccurrencesByHabitId(habitIdToRemove);
    setHabitIdToRemove(0);
    setIsRemovingHabit(false);
  };

  const handleEditStart = (habitId: number) => {
    setIsEditingHabit(true);
    setHabitIdToEdit(habitId);
  };

  const handleEditEnd = () => {
    setIsEditingHabit(false);
    setHabitIdToEdit(0);
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
                        backgroundColor:
                          traitsMap[habit.traitId]?.color || 'black',
                      }}
                    />
                    <p role="habit-trait-chip-name">
                      {traitsMap[habit.traitId]?.name || 'Unknown'}
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
                      onClick={() => handleEditStart(habit.id)}
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
                      onClick={() => handleRemovalConfirmOpen(habit.id)}
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
      {!!habitIdToEdit && (
        <EditHabitDialog
          open={isEditingHabit}
          onClose={handleEditEnd}
          habit={habitsMap[habitIdToEdit]}
        />
      )}
      <AddHabitDialogButton />
      <ConfirmDialog
        open={!!habitIdToRemove}
        heading="Delete habit"
        onConfirm={handleRemovalConfirmed}
        onCancel={handleRemovalCancel}
        loading={isRemovingHabit}
      >
        <div>
          Are you sure you want to delete{' '}
          <strong>{habitsMap[habitIdToRemove]?.name}</strong> habit?
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
