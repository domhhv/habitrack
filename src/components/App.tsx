import { AppHeader } from '@components';
import {
  AuthProvider,
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
} from '@context';
import { CssVarsProvider } from '@mui/joy';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseClient, theme } from '@utils';
import React from 'react';

import Router from './Router';

const App = () => {
  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="system"
      modeStorageKey="user_mode_preference"
    >
      <SessionContextProvider supabaseClient={supabaseClient}>
        <SnackbarProvider>
          <AuthProvider>
            <HabitsProvider>
              <CalendarEventsProvider>
                <AppHeader />
                <Router />
              </CalendarEventsProvider>
            </HabitsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </SessionContextProvider>
    </CssVarsProvider>
  );
};

export default App;
