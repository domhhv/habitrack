import {
  cn,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Pagination,
  TableColumn,
  TableHeader,
} from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import pluralize from 'pluralize';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { Link } from 'react-router';

import { TraitChip, EditHabitDialog, AddHabitDialogButton } from '@components';
import type { Habit, HabitStats } from '@models';
import { StorageBuckets } from '@models';
import { listFiles, deleteFile, getHabitsStats } from '@services';
import {
  useUser,
  useHabits,
  useHabitActions,
  useConfirmationActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import habitColumns from './habit-columns';
import HabitIcon from './HabitIcon';
import HabitLastEntry from './HabitLastEntry';
import HabitLongestStreak from './HabitLongestStreak';
import HabitTotalEntries from './HabitTotalEntries';

const ROWS_PER_PAGE = 10;

const HabitsTable = () => {
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [page, setPage] = React.useState(1);
  const [habitsStats, setHabitsStats] = React.useState<
    Record<Habit['id'], HabitStats>
  >({});

  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone: getLocalTimeZone(),
    year: 'numeric',
  });

  const { user } = useUser();
  const habits = useHabits();
  const { removeHabit } = useHabitActions();
  const { askConfirmation } = useConfirmationActions();

  React.useEffect(() => {
    const habitIds = Object.keys(habits);

    if (habitIds.length === 0) {
      setHabitsStats({});

      return;
    }

    setHabitsStats({});

    // TODO: replace `.catch(console.error)` with to be chosen error tracking SDK
    getHabitsStats(habitIds)
      .then((stats) => {
        setHabitsStats(
          stats.reduce((statsMap, stat) => {
            if (!stat.habitId) {
              return statsMap;
            }

            return {
              ...statsMap,
              [stat.habitId]: stat,
            };
          }, {})
        );
      })
      .catch(console.error);
  }, [habits]);

  const handleEditStart = (habit: Habit) => {
    setHabitToEdit(habit);
  };

  const handleEditEnd = () => {
    setHabitToEdit(null);
  };

  const handleDelete = async (habit: Habit) => {
    const confirmed = await askConfirmation({
      color: 'danger',
      title: 'Delete habit',
      description: (
        <div>
          Are you sure you want to delete <strong>{habit.name}</strong> habit?
          <br />
          <br />
          <i className="text-sm">
            This action deletes all related calendar entries and can&apos;t be
            undone
          </i>
        </div>
      ),
    });

    if (!confirmed || !user) {
      return;
    }

    const remove = async () => {
      const habitOccurrencePhotos = await listFiles(
        StorageBuckets.OCCURRENCE_PHOTOS,
        `${user.id}/${habit.id}/`
      );

      if (habitOccurrencePhotos.length > 0) {
        await Promise.all(
          habitOccurrencePhotos.map((photo) => {
            return deleteFile(
              StorageBuckets.OCCURRENCE_PHOTOS,
              `${user.id}/${habit.id}/${photo.name}`
            );
          })
        );
      }

      return removeHabit(habit);
    };

    void handleAsyncAction(remove(), 'remove_habit');
  };

  const habitsList = Object.values(habits);

  const pages = Math.ceil(habitsList.length / ROWS_PER_PAGE);

  const paginatedHabits = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    return habitsList.slice(start, end);
  }, [page, habitsList]);

  return (
    <div className="w-full space-y-4 px-8 pt-4 pb-2 lg:px-16">
      <div className="space-y-1">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300">
            Your habits
          </h1>

          <AddHabitDialogButton />
        </div>

        {habitsList.length ? (
          <p className="text- text-sm">
            You&apos;re tracking {pluralize('habit', habitsList.length, true)}
          </p>
        ) : (
          <p>Add a habit to start tracking</p>
        )}
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
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showShadow
                page={page}
                showControls
                total={pages}
                color="primary"
                onChange={setPage}
              />
            </div>
          ) : null
        }
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
          {paginatedHabits.map((habit) => {
            const habitStats = habitsStats[habit.id] || {};

            return (
              <TableRow
                key={habit.id}
                className="hover:bg-content2"
                aria-labelledby={`habit-name-${habit.id}`}
              >
                <TableCell className="w-10 rounded-l-md">
                  <HabitIcon habit={habit} />
                </TableCell>
                <TableCell>
                  <Link
                    className="font-semibold"
                    to={`/habits/${habit.id}`}
                    id={`habit-name-${habit.id}`}
                  >
                    {habit.name}
                  </Link>
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
                  <HabitLastEntry
                    timestamp={Number(new Date(habitStats.lastEntryAt || 0))}
                  />
                </TableCell>
                <TableCell>
                  <HabitLongestStreak
                    streak={{
                      streakEnd: habitStats.longestStreakEnd,
                      streakLength: habitStats.longestStreakLength,
                      streakStart: habitStats.longestStreakStart,
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  aria-label={`Total entries for ${habit.name}`}
                >
                  <HabitTotalEntries count={habitStats.totalEntries} />
                </TableCell>
                <TableCell aria-label="Actions" className="rounded-r-md">
                  <div
                    role="group"
                    className="flex justify-end gap-2"
                    aria-label={`Actions for habit ${habit.name}`}
                  >
                    <Tooltip
                      closeDelay={0}
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
                      closeDelay={0}
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
                          return handleDelete(habit);
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
    </div>
  );
};

export default HabitsTable;
