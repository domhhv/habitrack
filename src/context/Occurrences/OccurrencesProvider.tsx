import {
  useSnackbar,
  OccurrencesContext,
  useHabits,
  useTraits,
} from '@context';
import { useDataFetch } from '@hooks';
import type { AddOccurrence, Occurrence, OccurrencesDateMap } from '@models';
import {
  createOccurrence,
  destroyOccurrence,
  listOccurrences,
} from '@services';
import { cache } from '@utils';
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
  const { allTraits } = useTraits();

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
    setFetchingOccurrences(true);
    const result = await listOccurrences([rangeStart, rangeEnd]);
    setFetchingOccurrences(false);
    setAllOccurrences(result);
  }, [rangeStart, rangeEnd]);

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
    const initialFilteredTraitIds = allTraits.map((trait) =>
      trait.id.toString()
    );
    setFilteredBy({
      habitIds: new Set(initialFilteredHabitIds),
      traitIds: new Set(initialFilteredTraitIds),
    });
  }, [habits, allTraits]);

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
    async (occurrence: AddOccurrence) => {
      try {
        setAddingOccurrence(true);

        const nextOccurrence = await createOccurrence(occurrence);

        setAllOccurrences((prevOccurrences) => [
          ...prevOccurrences,
          nextOccurrence,
        ]);

        cache.set([rangeStart, rangeEnd].toString(), [
          ...cache.get([rangeStart, rangeEnd].toString()),
          nextOccurrence,
        ]);
      } catch (e) {
        showSnackbar('Something went wrong while adding your habit', {
          color: 'danger',
          dismissible: true,
        });

        console.error(e);
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

        const cachedOccurrences = cache.get([rangeStart, rangeEnd].toString());

        cache.set(
          [rangeStart, rangeEnd].toString(),
          cachedOccurrences.filter((occurrence: Occurrence) => {
            return occurrence.id !== id;
          })
        );

        showSnackbar('Your habit entry has been deleted from the calendar.', {
          dismissible: true,
        });
      } catch (error) {
        showSnackbar('Something went wrong while removing your habit entry', {
          color: 'danger',
          dismissible: true,
        });

        console.error(error);
      } finally {
        setOccurrenceIdBeingDeleted(0);
      }
    },
    [showSnackbar, rangeStart, rangeEnd]
  );

  const removeOccurrencesByHabitId = (habitId: number) => {
    setOccurrences((prevOccurrences) => {
      const nextOccurrences = prevOccurrences.filter((occurrence) => {
        return occurrence.habitId !== habitId;
      });

      return nextOccurrences;
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
