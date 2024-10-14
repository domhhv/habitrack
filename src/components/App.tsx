import { AppHeader, Calendar, AccountPage, HabitsPage } from '@components';
import { useCalendar } from '@hooks';
import { setDefaultOptions } from 'date-fns';
import { enGB } from 'date-fns/locale';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Providers from './Providers';

setDefaultOptions({ locale: enGB });

const App = () => {
  const { rangeStart, rangeEnd, state, weeksInMonth } = useCalendar();

  return (
    <Providers rangeStart={rangeStart} rangeEnd={rangeEnd}>
      <AppHeader />
      <div className="flex h-full flex-1 items-start">
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
