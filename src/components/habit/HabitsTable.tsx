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
import { TrashSimple, PencilSimple } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import {
  TraitChip,
  ConfirmDialog,
  EditHabitDialog,
  AddHabitDialogButton,
} from '@components';
import { useScreenWidth } from '@hooks';
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
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
  });

  const habits = useHabits();
  const { isMobile } = useScreenWidth();
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
    <>
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

      <div className="m-auto my-4 flex w-full justify-end px-8 lg:px-16 lg:py-4">
        <AddHabitDialogButton />
      </div>

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
    </>
  );
};

export default HabitsTable;
