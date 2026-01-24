import type { AuthError } from '@supabase/supabase-js';
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError>();
  const range = useCalendarRange();
  const { setUser } = useUserActions();
  const { clearOccurrences } = useOccurrenceActions();
  const { clearNotes } = useNoteActions();
  const { clearTraits } = useTraitActions();
  const { clearHabits } = useHabitActions();

  React.useEffect(() => {
    getSession()
      .then(setUser)
      .catch(setError)
      .finally(() => {
        setIsLoading(false);
      });
  }, [setUser]);

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
  }, [range, setUser, clearNotes, clearTraits, clearHabits, clearOccurrences]);

  return { error, isLoading };
};

export default useSession;
