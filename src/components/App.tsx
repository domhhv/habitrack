import { AppHeader, Calendar } from '@components';
import {
  HabitsProvider,
  CalendarEventsProvider,
  SnackbarProvider,
} from '@context';
import { Box } from '@mui/joy';
import React from 'react';

function App() {
  return (
    <SnackbarProvider>
      <HabitsProvider>
        <CalendarEventsProvider>
          <Box textAlign="center">
            <AppHeader />
            <Calendar aria-label="Event date" />
          </Box>
        </CalendarEventsProvider>
      </HabitsProvider>
    </SnackbarProvider>
  );
}

export default App;
