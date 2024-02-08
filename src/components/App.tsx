import { AppHeader, Calendar, AccountPage } from '@components';
import {
  AuthProvider,
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
} from '@context';
import { CssVarsProvider, styled } from '@mui/joy';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseClient, theme } from '@utils';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const StyledAppContainerDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

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
                <BrowserRouter>
                  <AppHeader />
                  <StyledAppContainerDiv>
                    <Routes>
                      <Route
                        path="/calendar"
                        element={<Calendar aria-label="Event date" />}
                      />
                      <Route path="/account" element={<AccountPage />} />
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
