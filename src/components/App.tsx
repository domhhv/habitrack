import { AppHeader, Calendar, AccountPage, HabitsPage } from '@components';
import { useCalendar } from '@hooks';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Providers from './Providers';

const App = () => {
  const { rangeStart, rangeEnd, state, weeksInMonth } = useCalendar();

  return (
    <BrowserRouter>
      <Providers rangeStart={rangeStart} rangeEnd={rangeEnd}>
        <AppHeader />
        <div className="flex flex-1 flex-col items-center bg-neutral-200 dark:bg-neutral-800">
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
    </BrowserRouter>
  );
};

export default App;
