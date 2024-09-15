import { AppHeader, Calendar, AccountPage, HabitsPage } from '@components';
import { useCalendar } from '@hooks';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Providers from './Providers';

const App = () => {
  const { rangeStart, rangeEnd, state, weeksInMonth } = useCalendar();

  React.useEffect(() => {
    const root = document.getElementById('root');

    if (!root) return;

    root.style.height = '100%';
  });

  return (
    <Providers rangeStart={rangeStart} rangeEnd={rangeEnd}>
      <AppHeader />
      <div className="flex h-full flex-1 items-start bg-neutral-100 dark:bg-neutral-900">
        <Routes>
          <Route
            path="/calendar"
            element={
              <Calendar
                state={state}
                weeksInMonth={weeksInMonth}
                aria-label="Event date"
              />
            }
          />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </div>
    </Providers>
  );
};

export default App;
