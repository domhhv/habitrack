import {
  Alert,
  Button,
  Spinner,
  ToastProvider,
  HeroUIProvider,
} from '@heroui/react';
import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { I18nProvider } from 'react-aria';
import { Route, Routes, Navigate, useNavigate } from 'react-router';

import {
  AppHeader,
  NoteDrawer,
  OccurrenceDrawer,
  ConfirmationDialog,
} from '@components';
import { useSession } from '@hooks';
import {
  NotesPage,
  HabitsPage,
  AccountPage,
  DayCalendarPage,
  WeekCalendarPage,
  MonthCalendarPage,
} from '@pages';
import { getErrorMessage } from '@utils';

const App = () => {
  const { error, isLoading } = useSession();
  const navigate = useNavigate();

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
      <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 items-center justify-center">
        <Alert
          color="danger"
          variant="solid"
          title="We couldn't load your session. Please try reloading the page."
          classNames={{
            base: 'w-4/5 max-w-3xl',
            title: 'font-bold',
          }}
          description={`We're sorry for the inconvenience. Here're the error details: ${getErrorMessage(error)}`}
          endContent={
            <Button
              color="danger"
              variant="faded"
              onPress={() => {
                window.location.reload();
              }}
            >
              Reload
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <HeroUIProvider navigate={navigate}>
      <I18nProvider>
        <AppHeader />
        <NoteDrawer />
        <OccurrenceDrawer />
        <ConfirmationDialog />
        <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 flex-col items-start">
          <Routes>
            <Route
              element={<MonthCalendarPage />}
              path="/calendar/month/:year?/:month?/:day?"
            />
            <Route
              element={<DayCalendarPage />}
              path="/calendar/day/:year?/:month?/:day?"
            />
            <Route
              element={<WeekCalendarPage />}
              path="/calendar/week/:year?/:month?/:day?"
            />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route
              path="*"
              element={<Navigate replace to="/calendar/month" />}
            />
          </Routes>
          <ToastProvider
            placement="top-center"
            toastProps={{
              variant: 'solid',
            }}
          />
        </main>
        <Analytics />
      </I18nProvider>
    </HeroUIProvider>
  );
};

export default App;
