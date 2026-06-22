import { Analytics } from '@vercel/analytics/react';
import React from 'react';

import {
  AppHeader,
  NoteDrawer,
  InfinityLoader,
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
      <main className="flex h-full flex-1 items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-row items-center gap-4">
          <InfinityLoader color="var(--accent)" />
          <span>We're preparing the app...</span>
        </div>
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
      <main className="flex h-full flex-1 flex-col items-start bg-white max-md:pb-11.25 dark:bg-black">
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
