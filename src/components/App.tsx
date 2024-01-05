import { AppHeader, Calendar } from '@components';
import { HabitsProvider, CalendarEventsProvider } from '@context';
import { Box } from '@mui/joy';
import React from 'react';

function App() {
  return (
    <HabitsProvider>
      <CalendarEventsProvider>
        <Box textAlign="center">
          <AppHeader />
          <Calendar aria-label="Event date" />
        </Box>
      </CalendarEventsProvider>
    </HabitsProvider>
  );
}

export default App;
