import {
  useSnackbar,
  OccurrencesContext,
  useHabits,
  useTraits,
} from '@context';
import type { AddOccurrence, Occurrence, OccurrencesDateMap } from '@models';
import {
  createOccurrence,
  destroyOccurrence,
  listOccurrences,
} from '@services';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import React from 'react';

type Props = {
  children: React.ReactNode;
  rangeStart: number;
  rangeEnd: number;
};

export type OccurrenceFilters = {
  habitIds: number[];
  traitIds: (number | string)[];
};

const OccurrencesProvider = ({ children, rangeStart, rangeEnd }: Props) => {
  const { showSnackbar } = useSnackbar();
  const supabase = useSupabaseClient();
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
    habitIds: [],
    traitIds: [],
  });

  React.useEffect(() => {
    const filteredHabitIds = habits.map((habit) => habit.id);
    const filteredTraitIds = allTraits.map((trait) => trait.id);
    setFilteredBy({ habitIds: filteredHabitIds, traitIds: filteredTraitIds });
  }, [habits, allTraits]);

  React.useEffect(() => {
    setOccurrences(
      allOccurrences.filter((occurrence) => {
        return (
          filteredBy.habitIds.includes(occurrence.habitId) &&
          filteredBy.traitIds.includes(
            habits.find((habit) => habit.id === occurrence.habitId)
              ?.traitId as number
          )
        );
      })
    );
  }, [filteredBy, allOccurrences, habits]);

  const fetchOccurrences = React.useCallback(async () => {
    setFetchingOccurrences(true);
    const result = await listOccurrences([rangeStart, rangeEnd]);
    setOccurrences(result);
    setFetchingOccurrences(false);
    setAllOccurrences(result);
  }, [rangeStart, rangeEnd]);

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearOccurrences();
      }

      if (event === 'SIGNED_IN') {
        void fetchOccurrences();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, fetchOccurrences]);

  React.useEffect(() => {
    const occurrencesByDate = occurrences.reduce(
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

    setOccurrencesByDate(occurrencesByDate);
  }, [occurrences]);

  const filterBy = React.useCallback((options: OccurrenceFilters) => {
    setFilteredBy(options);
  }, []);

  const addOccurrence = React.useCallback(
    async (occurrence: AddOccurrence) => {
      try {
        setAddingOccurrence(true);

        const nextOccurrence = await createOccurrence(occurrence);

        setOccurrences((prevOccurrences) => [
          ...prevOccurrences,
          nextOccurrence,
        ]);

        showSnackbar('Your habit entry has been added to the calendar!', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
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
    [showSnackbar]
  );

  const removeOccurrence = React.useCallback(
    async (id: number) => {
      try {
        setOccurrenceIdBeingDeleted(id);

        await destroyOccurrence(id);

        setOccurrences((prevOccurrences) => {
          const nextOccurrence = [...prevOccurrences];
          const indexToRemove = nextOccurrence.findIndex(
            (event) => event.id === id
          );
          delete nextOccurrence[indexToRemove];
          return nextOccurrence;
        });

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
    [showSnackbar]
  );

  const removeOccurrencesByHabitId = (habitId: number) => {
    setOccurrences((prevOccurrences) => {
      const nextOccurrences = prevOccurrences.filter((occurrence) => {
        return occurrence.habitId !== habitId;
      });

      return nextOccurrences;
    });
  };

  const clearOccurrences = () => {
    setOccurrences([]);
    setOccurrencesByDate({});
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
