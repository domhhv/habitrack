import { Spinner } from '@heroui/react';
import { Analytics } from '@vercel/analytics/react';
import React from 'react';

import {
  AppHeader,
  NoteDrawer,
  OccurrenceDrawer,
  ConfirmationDialog,
} from '@components';
import { useSession } from '@hooks';
import { ErrorFallbackPage } from '@pages';

import AppRoutes from './Routes';

const App = () => {
  const { error, isLoading } = useSession();

  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  if (isLoading) {
    return (
      <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 items-center justify-center">
        <Spinner
          labelColor="primary"
          className="flex-row gap-4"
          label="Loading your session..."
        />
      </main>
    );
  }

  if (error) {
    return (
      <ErrorFallbackPage
        error={error}
        title="We couldn't load your session. Please try reloading the page."
      />
    );
  }

  return (
    <>
      <Analytics />
      <AppHeader />
      <NoteDrawer />
      <OccurrenceDrawer />
      <ConfirmationDialog />
      <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 flex-col items-start max-md:pb-11.25">
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
