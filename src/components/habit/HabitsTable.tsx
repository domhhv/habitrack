import { Table, Button, Tooltip, Pagination } from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon } from '@phosphor-icons/react';
import { useRollbar } from '@rollbar/react';
import pluralize from 'pluralize';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { Link } from 'react-router';

import { TraitChip, AddHabitDialogButton } from '@components';
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
  const rollbar = useRollbar();
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

  const user = useUser();
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
      .catch((error) => {
        rollbar.error(error);
      });
  }, [habits, rollbar]);

  const handleDelete = async (habit: Habit) => {
    const confirmed = await askConfirmation({
      title: 'Delete habit',
      variant: 'danger',
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

  const totalPages = Math.ceil(habitsList.length / ROWS_PER_PAGE);

  const pages = Array.from({ length: totalPages }, (_, i) => {
    return i + 1;
  });

  const paginatedHabits = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return habitsList.slice(start, start + ROWS_PER_PAGE);
  }, [page, habitsList]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, habitsList.length);

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
        aria-label="Habits tracking table"
        className="scrollbar-hide h-[calc(100vh-148px)] min-h-100 w-full overflow-scroll"
      >
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header columns={habitColumns}>
              {(column) => {
                return (
                  <Table.Column
                    key={column.key}
                    aria-label={column.label}
                    isRowHeader={column.key === 'icon'}
                  >
                    {column.label}
                  </Table.Column>
                );
              }}
            </Table.Header>
            <Table.Body items={paginatedHabits} aria-label="Habits data">
              {(habit) => {
                const habitStats = habitsStats[habit.id] || {};

                return (
                  <Table.Row
                    key={habit.id}
                    className="hover:bg-content2"
                    aria-labelledby={`habit-name-${habit.id}`}
                  >
                    <Table.Collection>
                      <Table.Cell className="w-10 rounded-l-md">
                        <HabitIcon habit={habit} />
                      </Table.Cell>
                      <Table.Cell>
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
                      </Table.Cell>
                      <Table.Cell>
                        <TraitChip trait={habit.trait} />
                      </Table.Cell>
                      <Table.Cell>
                        {dateFormatter.format(new Date(habit.createdAt))}
                      </Table.Cell>
                      <Table.Cell>
                        <HabitLastEntry
                          timestamp={Number(
                            new Date(habitStats.lastEntryAt || 0)
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <HabitLongestStreak
                          streak={{
                            streakEnd: habitStats.longestStreakEnd,
                            streakLength: habitStats.longestStreakLength,
                            streakStart: habitStats.longestStreakStart,
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell
                        className="text-center"
                        aria-label={`Total entries for ${habit.name}`}
                      >
                        <HabitTotalEntries count={habitStats.totalEntries} />
                      </Table.Cell>
                      <Table.Cell aria-label="Actions" className="rounded-r-md">
                        <div
                          role="group"
                          className="flex justify-end gap-2"
                          aria-label={`Actions for habit ${habit.name}`}
                        >
                          <Tooltip closeDelay={0}>
                            <Tooltip.Trigger>
                              <Button
                                size="sm"
                                isIconOnly
                                variant="ghost"
                                className="group text-danger"
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
                            </Tooltip.Trigger>
                            <Tooltip.Content>Delete habit</Tooltip.Content>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Collection>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          <Pagination size="sm">
            <Pagination.Summary>
              {start} to {end} of {habitsList.length} results
            </Pagination.Summary>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => {
                    return setPage((p) => {
                      return Math.max(1, p - 1);
                    });
                  }}
                >
                  <Pagination.PreviousIcon />
                  Prev
                </Pagination.Previous>
              </Pagination.Item>
              {pages.map((p) => {
                return (
                  <Pagination.Item key={p}>
                    <Pagination.Link
                      isActive={p === page}
                      onPress={() => {
                        return setPage(p);
                      }}
                    >
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                );
              })}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === totalPages}
                  onPress={() => {
                    return setPage((p) => {
                      return Math.min(totalPages, p + 1);
                    });
                  }}
                >
                  Next
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      </Table>
    </div>
  );
};

export default HabitsTable;
