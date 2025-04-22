import { AppHeader } from '@components';
import {
  HabitsPage,
  AccountPage,
  WeekCalendarPage,
  MonthCalendarPage,
} from '@pages';
import { Analytics } from '@vercel/analytics/react';
import { setDefaultOptions } from 'date-fns';
import { enGB } from 'date-fns/locale';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import Providers from './components/Providers';

setDefaultOptions({ locale: enGB });

const App = () => {
  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  return (
    <Providers>
      <AppHeader />
      <main className="flex h-full flex-1 flex-col items-start bg-background-50 dark:bg-background-700">
        <Routes>
          <Route
            path="/calendar/month/:year?/:month?/:day?"
            element={<MonthCalendarPage />}
          />
          <Route
            path="/calendar/week/:year?/:month?/:day?"
            element={<WeekCalendarPage />}
          />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/calendar/month" replace />} />
        </Routes>
      </main>
      <Analytics />
    </Providers>
  );
};

export default App;
