import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { Route, Routes, Navigate } from 'react-router';

import { AppHeader } from '@components';
import {
  HabitsPage,
  AccountPage,
  WeekCalendarPage,
  MonthCalendarPage,
} from '@pages';

import Providers from './components/Providers';

const App = () => {
  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  return (
    <Providers>
      <AppHeader />
      <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 flex-col items-start">
        <Routes>
          <Route
            element={<MonthCalendarPage />}
            path="/calendar/month/:year?/:month?/:day?"
          />
          <Route
            element={<WeekCalendarPage />}
            path="/calendar/week/:year?/:month?/:day?"
          />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate replace to="/calendar/month" />} />
        </Routes>
      </main>
      <Analytics />
    </Providers>
  );
};

export default App;
