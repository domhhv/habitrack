import camelcaseKeys from 'camelcase-keys';
import React from 'react';

import { getSession } from '@services';
import {
  useNoteActions,
  useUserActions,
  useHabitActions,
  useTraitActions,
  useOccurrenceActions,
} from '@stores';
import { supabaseClient } from '@utils';

const useSession = () => {
  const { setError, setIsLoading, setUser } = useUserActions();
  const { clearOccurrences } = useOccurrenceActions();
  const { clearNotes } = useNoteActions();
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
    setUser,
    fetchTraits,
    fetchHabits,
    clearTraits,
    clearHabits,
    clearNotes,
    clearOccurrences,
  ]);
};

export default useSession;
