import { AppHeader, Calendar } from '@components';
import {
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
  UserProvider,
} from '@context';
import { CssVarsProvider, styled } from '@mui/joy';
import { theme } from '@utils';
import React from 'react';

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
      <SnackbarProvider>
        <UserProvider>
          <HabitsProvider>
            <CalendarEventsProvider>
              <StyledAppContainerDiv>
                <AppHeader />
                <Calendar aria-label="Event date" />
              </StyledAppContainerDiv>
            </CalendarEventsProvider>
          </HabitsProvider>
        </UserProvider>
      </SnackbarProvider>
    </CssVarsProvider>
  );
};

export default App;
