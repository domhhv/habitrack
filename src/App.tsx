import { Analytics } from '@vercel/analytics/react';
import { setDefaultOptions } from 'date-fns';
import { enGB } from 'date-fns/locale';
import React from 'react';
import { useLocale } from 'react-aria';
import { Route, Routes, Navigate } from 'react-router';

import { AppHeader } from '@components';
import {
  HabitsPage,
  AccountPage,
  WeekCalendarPage,
  MonthCalendarPage,
} from '@pages';

import Providers from './components/Providers';

setDefaultOptions({ locale: enGB });

const App = () => {
  const { locale } = useLocale();

  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  return (
    <Providers locale={locale}>
      <AppHeader />
      <main className="flex h-full flex-1 flex-col items-start bg-background-50 dark:bg-background-700">
        <Routes>
          <Route
            path="/calendar/month/:year?/:month?/:day?"
            element={<MonthCalendarPage locale={locale} />}
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
