import {
  useSnackbar,
  OccurrencesContext,
  useHabits,
  useTraits,
} from '@context';
import { cacheOccurrence, uncacheOccurrence } from '@helpers';
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
import { getErrorMessage } from '@utils';
import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  rangeStart: number;
  rangeEnd: number;
};

export type OccurrenceFilters = {
  habitIds: Set<string>;
  traitIds: Set<string>;
};

const OccurrencesProvider = ({ children, rangeStart, rangeEnd }: Props) => {
  const { showSnackbar } = useSnackbar();
  const { habits } = useHabits();
  const { traits } = useTraits();

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

  const fetchOccurrences = React.useCallback(async () => {
    try {
      setFetchingOccurrences(true);
      setAllOccurrences(await listOccurrences([rangeStart, rangeEnd]));
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
  }, [rangeStart, rangeEnd, showSnackbar]);

  const clearOccurrences = React.useCallback(() => {
    setOccurrences([]);
    setOccurrencesByDate({});
  }, []);

  useDataFetch({
    clear: clearOccurrences,
    load: fetchOccurrences,
  });

  React.useEffect(() => {
    void fetchOccurrences();
  }, [rangeStart, rangeEnd, fetchOccurrences]);

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
          filteredBy.traitIds.has(
            habits
              .find((habit) => habit.id === occurrence.habitId)
              ?.traitId.toString() ?? ''
          )
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

        cacheOccurrence([rangeStart, rangeEnd], nextOccurrence);

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
    [showSnackbar, rangeStart, rangeEnd]
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

        uncacheOccurrence([rangeStart, rangeEnd], id);

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
    [showSnackbar, rangeStart, rangeEnd]
  );

  const removeOccurrencesByHabitId = (habitId: number) => {
    setOccurrences((prevOccurrences) => {
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
    ]
  );

  return (
    <OccurrencesContext.Provider value={value}>
      {children}
    </OccurrencesContext.Provider>
  );
};

export default React.memo(OccurrencesProvider);
