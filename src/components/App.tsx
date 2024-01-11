import { AppHeader, Calendar } from '@components';
import {
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
  UserProvider,
} from '@context';
import { Box } from '@mui/joy';
import React from 'react';

function App() {
  return (
    <SnackbarProvider>
      <UserProvider>
        <HabitsProvider>
          <CalendarEventsProvider>
            <Box textAlign="center">
              <AppHeader />
              <Calendar aria-label="Event date" />
            </Box>
          </CalendarEventsProvider>
        </HabitsProvider>
      </UserProvider>
    </SnackbarProvider>
  );
}

export default App;
