import {
  fromDate,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';
import camelcaseKeys from 'camelcase-keys';
import React from 'react';

import { getSession } from '@services';
import {
  useNoteActions,
  useUserActions,
  useHabitActions,
  useTraitActions,
  useCalendarRange,
  useOccurrenceActions,
} from '@stores';
import { supabaseClient } from '@utils';

const useSession = () => {
  const range = useCalendarRange();
  const { setError, setIsLoading, setUser } = useUserActions();
  const { clearOccurrences, fetchOccurrences } = useOccurrenceActions();
  const { clearNotes, fetchNotes } = useNoteActions();
  const { clearTraits, fetchTraits } = useTraitActions();
  const { clearHabits, fetchHabits } = useHabitActions();

  React.useEffect(() => {
    getSession()
      .then(setUser)
      .catch(setError)
      .finally(() => {
        setIsLoading(false);
      });
  }, [setIsLoading, setError, setUser]);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        [
          'INITIAL_SESSION',
          'TOKEN_REFRESHED',
          'SIGNED_IN',
          'USER_UPDATED',
        ].includes(event)
      ) {
        setUser(camelcaseKeys(session.user, { deep: true }));
        void fetchTraits();
        void fetchHabits();

        if (range.every(Boolean)) {
          void fetchOccurrences(range);
          void fetchNotes([
            toCalendarDateTime(
              fromDate(new Date(range[0]), getLocalTimeZone())
            ),
            toCalendarDateTime(
              fromDate(new Date(range[1]), getLocalTimeZone())
            ),
          ]);
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        clearTraits();
        clearHabits();
        clearNotes();
        clearOccurrences();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    range,
    setUser,
    fetchNotes,
    clearNotes,
    fetchTraits,
    clearTraits,
    fetchHabits,
    clearHabits,
    fetchOccurrences,
    clearOccurrences,
  ]);
};

export default useSession;
