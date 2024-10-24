import { OccurrencesContext } from '@context';
import { cacheOccurrence, occurrencesCache, uncacheOccurrence } from '@helpers';
import { useDataFetch } from '@hooks';
import type {
  Occurrence,
  OccurrencesDateMap,
  OccurrencesInsert,
} from '@models';
import {
  createOccurrence,
  destroyOccurrence,
  listOccurrences,
} from '@services';
import { useHabitsStore, useSnackbarsStore, useTraitsStore } from '@stores';
import { getErrorMessage } from '@utils';
import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export type OccurrenceFilters = {
  habitIds: Set<string>;
  traitIds: Set<string>;
};

const OccurrencesProvider = ({ children }: Props) => {
  const { showSnackbar } = useSnackbarsStore();
  const { habits } = useHabitsStore();
  const { traits } = useTraitsStore();

  const [addingOccurrence, setAddingOccurrence] = React.useState(false);
  const [fetchingOccurrences, setFetchingOccurrences] = React.useState(false);
  const [allOccurrences, setAllOccurrences] = React.useState<Occurrence[]>([]);
  const [occurrences, setOccurrences] = React.useState<Occurrence[]>([]);
  const [occurrencesByDate, setOccurrencesByDate] =
    React.useState<OccurrencesDateMap>({});
  const [occurrenceIdBeingDeleted, setOccurrenceIdBeingDeleted] =
    React.useState(0);
  const [filteredBy, setFilteredBy] = React.useState<OccurrenceFilters>({
    habitIds: new Set([]),
    traitIds: new Set([]),
  });
  const [range, setRange] = React.useState<[number, number]>([0, 0]);

  const handleRangeChange = React.useCallback((range: [number, number]) => {
    setRange(range);
  }, []);

  const fetchOccurrences = React.useCallback(async () => {
    try {
      if (range.every(Boolean)) {
        setFetchingOccurrences(true);
        setAllOccurrences(await listOccurrences(range));
      }
    } catch (error) {
      console.error(error);
      showSnackbar(
        'Something went wrong while fetching your habit entries. Please try reloading the page.',
        {
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
          dismissible: true,
        }
      );
    } finally {
      setFetchingOccurrences(false);
    }
  }, [range, showSnackbar]);

  const clearOccurrences = React.useCallback(() => {
    setAllOccurrences([]);
    occurrencesCache.clear();
  }, []);

  useDataFetch({
    clear: clearOccurrences,
    load: fetchOccurrences,
  });

  React.useEffect(() => {
    void fetchOccurrences();
  }, [fetchOccurrences]);

  React.useEffect(() => {
    const initialFilteredHabitIds = habits.map((habit) => habit.id.toString());
    const initialFilteredTraitIds = traits.map((trait) => trait.id.toString());
    setFilteredBy({
      habitIds: new Set(initialFilteredHabitIds),
      traitIds: new Set(initialFilteredTraitIds),
    });
  }, [habits, traits]);

  React.useEffect(() => {
    setOccurrences(
      allOccurrences.filter((occurrence) => {
        return (
          filteredBy.habitIds.has(occurrence.habitId.toString()) &&
          filteredBy.traitIds.has(occurrence.habit?.trait?.id.toString() || '')
        );
      })
    );
  }, [filteredBy, allOccurrences, habits]);

  React.useEffect(() => {
    const nextOccurrencesByDate = occurrences.reduce(
      (acc, occurrence) => {
        const { day } = occurrence;
        if (!acc[day]) {
          acc[day] = [occurrence];
        } else {
          acc[day].push(occurrence);
        }
        return acc;
      },
      {} as Record<string, Occurrence[]>
    );

    setOccurrencesByDate(nextOccurrencesByDate);
  }, [occurrences]);

  const filterBy = React.useCallback((options: OccurrenceFilters) => {
    setFilteredBy(options);
  }, []);

  const addOccurrence = React.useCallback(
    async (occurrence: OccurrencesInsert) => {
      try {
        setAddingOccurrence(true);

        const nextOccurrence = await createOccurrence(occurrence);

        cacheOccurrence(range, nextOccurrence);

        setAllOccurrences((prevOccurrences) => [
          ...prevOccurrences,
          nextOccurrence,
        ]);

        showSnackbar('Habit entry(s) are added to the calendar', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while adding your habit entry. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );

        console.error(error);
      } finally {
        setAddingOccurrence(false);
      }
    },
    [showSnackbar, range]
  );

  const removeOccurrence = React.useCallback(
    async (id: number) => {
      try {
        setOccurrenceIdBeingDeleted(id);

        await destroyOccurrence(id);

        setAllOccurrences((prevOccurrences) => {
          return prevOccurrences.filter((occurrence) => {
            return occurrence.id !== id;
          });
        });

        uncacheOccurrence(range, id);

        showSnackbar('Your habit entry has been deleted from the calendar.', {
          dismissible: true,
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while deleting your habit entry. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );

        console.error(error);
      } finally {
        setOccurrenceIdBeingDeleted(0);
      }
    },
    [showSnackbar, range]
  );

  const removeOccurrencesByHabitId = (habitId: number) => {
    setAllOccurrences((prevOccurrences) => {
      return prevOccurrences.filter((occurrence) => {
        return occurrence.habitId !== habitId;
      });
    });
  };

  const value = React.useMemo(
    () => ({
      addingOccurrence,
      fetchingOccurrences,
      occurrenceIdBeingDeleted,
      occurrencesByDate,
      occurrences,
      addOccurrence,
      removeOccurrence,
      removeOccurrencesByHabitId,
      filterBy,
      filteredBy,
      onRangeChange: handleRangeChange,
    }),
    [
      addingOccurrence,
      fetchingOccurrences,
      occurrencesByDate,
      occurrences,
      occurrenceIdBeingDeleted,
      addOccurrence,
      removeOccurrence,
      filterBy,
      filteredBy,
      handleRangeChange,
    ]
  );

  return (
    <OccurrencesContext.Provider value={value}>
      {children}
    </OccurrencesContext.Provider>
  );
};

export default React.memo(OccurrencesProvider);
