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
} from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import {
  TraitChip,
  ConfirmDialog,
  EditHabitDialog,
  AddHabitDialogButton,
} from '@components';
import type { Habit } from '@models';
import { useHabits } from '@stores';

import habitColumns from './habit-columns';
import HabitIcon from './HabitIcon';
import HabitLastEntry from './HabitLastEntry';
import HabitLongestStreak from './HabitLongestStreak';
import HabitTotalEntries from './HabitTotalEntries';
import useHabitRemoval from './use-habit-removal';

const HabitsTable = () => {
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone: getLocalTimeZone(),
    year: 'numeric',
  });

  const habits = useHabits();
  const {
    habitToRemove,
    handleRemovalConfirmed,
    handleRemovalEnd,
    handleRemovalStart,
    isRemoving,
  } = useHabitRemoval();

  const handleEditStart = (habit: Habit) => {
    setHabitToEdit(habit);
  };

  const handleEditEnd = () => {
    setHabitToEdit(null);
  };

  return (
    <div className="w-full space-y-4 px-8 pt-4 pb-2 lg:px-16">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300">
          Your habits
        </h1>

        <AddHabitDialogButton />
      </div>

      <Table
        shadow="none"
        isHeaderSticky
        aria-label="Habits tracking table"
        classNames={{
          base: cn(
            'overflow-scroll scrollbar-hide w-full [&>div]:bg-white [&>div]:dark:bg-background-800 h-[calc(100vh-148px)] min-h-[400px]'
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
          {Object.values(habits).map((habit) => {
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
                  {dateFormatter.format(new Date(habit.createdAt))}
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
                  <HabitTotalEntries id={habit.id} />
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
                        <PencilSimpleIcon
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
                        role="delete-habit-button"
                        aria-label={`Delete habit: ${habit.name}`}
                        aria-describedby={`delete-tooltip-${habit.id}`}
                        data-testid={`delete-habit-id-${habit.id}-button`}
                        onPress={() => {
                          return handleRemovalStart(habit);
                        }}
                      >
                        <TrashSimpleIcon
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
    </div>
  );
};

export default HabitsTable;
