import { useSnackbar, OccurrencesContext } from '@context';
import type { AddOccurrence, Occurrence, OccurrencesDateMap } from '@models';
import {
  createOccurrence,
  destroyOccurrence,
  listOccurrences,
} from '@services';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import React from 'react';

type Props = {
  children: React.ReactNode;
  range: [number, number];
};

const OccurrencesProvider = ({ children, range }: Props) => {
  const { showSnackbar } = useSnackbar();
  const user = useUser();
  const supabase = useSupabaseClient();

  const [addingOccurrence, setAddingOccurrence] = React.useState(false);
  const [fetchingOccurrences, setFetchingOccurrences] = React.useState(false);
  const [occurrences, setOccurrences] = React.useState<Occurrence[]>([]);
  const [occurrencesByDate, setOccurrencesByDate] =
    React.useState<OccurrencesDateMap>({});
  const [occurrenceIdBeingDeleted, setOccurrenceIdBeingDeleted] =
    React.useState(0);

  const fetchOccurrences = React.useCallback(async () => {
    setFetchingOccurrences(true);
    const occurrences = await listOccurrences(range);
    setOccurrences(occurrences);
    setFetchingOccurrences(false);
  }, [range]);

  React.useEffect(() => {
    void fetchOccurrences();
  }, [range, fetchOccurrences]);

  React.useEffect(() => {
    void fetchOccurrences();

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
  }, [user, supabase, showSnackbar, fetchOccurrences]);

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
    console.log('called useEffect');
  }, [occurrences]);

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
    }),
    [
      addingOccurrence,
      fetchingOccurrences,
      occurrencesByDate,
      occurrences,
      occurrenceIdBeingDeleted,
      addOccurrence,
      removeOccurrence,
    ]
  );

  return (
    <OccurrencesContext.Provider value={value}>
      {children}
    </OccurrencesContext.Provider>
  );
};

export default OccurrencesProvider;
