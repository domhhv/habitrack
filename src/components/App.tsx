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
    <HabitsProvider>
      <CalendarEventsProvider>
        <SnackbarProvider>
          <Box textAlign="center">
            <AppHeader />
            <Calendar aria-label="Event date" />
          </Box>
        </SnackbarProvider>
      </CalendarEventsProvider>
    </HabitsProvider>
  );
}

export default App;
