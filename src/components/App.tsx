import { AppHeader, Calendar, AccountPage } from '@components';
import {
  AuthProvider,
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
} from '@context';
import { USER_THEME_STORAGE_KEY } from '@hooks';
import { CssVarsProvider, styled } from '@mui/joy';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseClient, theme } from '@utils';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import HabitsPage from './habit/HabitsPage';

const StyledAppContainerDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  [theme.getColorSchemeSelector('light')]: {
    backgroundColor: theme.palette.neutral[100],
  },
  [theme.getColorSchemeSelector('dark')]: {
    backgroundColor: theme.palette.neutral[800],
  },
});

const App = () => {
  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="light"
      modeStorageKey={USER_THEME_STORAGE_KEY}
    >
      <SessionContextProvider supabaseClient={supabaseClient}>
        <SnackbarProvider>
          <AuthProvider>
            <HabitsProvider>
              <CalendarEventsProvider>
                <BrowserRouter>
                  <AppHeader />
                  <StyledAppContainerDiv>
                    <Routes>
                      <Route
                        path="/calendar"
                        element={<Calendar aria-label="Event date" />}
                      />
                      <Route path="/habits" element={<HabitsPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route
                        path="*"
                        element={<Navigate to="/calendar" replace />}
                      />
                    </Routes>
                  </StyledAppContainerDiv>
                </BrowserRouter>
              </CalendarEventsProvider>
            </HabitsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </SessionContextProvider>
    </CssVarsProvider>
  );
};

export default App;
