import { AppHeader, Calendar } from '@components';
import {
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
  UserProvider,
} from '@context';
import { styled } from '@mui/joy';
import React from 'react';

const StyledAppContainerDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

const App = () => {
  return (
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
  );
};

export default App;
