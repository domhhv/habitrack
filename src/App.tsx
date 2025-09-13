import { Analytics } from '@vercel/analytics/react';
import { setDefaultOptions } from 'date-fns';
import { uk, enGB, enUS } from 'date-fns/locale';
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

  const dateFnsLocale = React.useMemo(() => {
    switch (locale) {
      case 'uk-UA':
        return uk;

      case 'en-US':
        return enUS;

      case 'en-GB':
      default:
        return enGB;
    }
  }, [locale]);

  React.useEffect(() => {
    setDefaultOptions({ locale: dateFnsLocale });
  }, [dateFnsLocale]);

  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  return (
    <Providers locale={locale}>
      <AppHeader />
      <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 flex-col items-start">
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
