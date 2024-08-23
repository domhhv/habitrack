import { AppHeader, Calendar, AccountPage, HabitsPage } from '@components';
import { useCalendar } from '@hooks';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Providers from './Providers';
import { StyledAppContainerDiv } from './styled';

const App = () => {
  const { rangeStart, rangeEnd, state, weeksInMonth } = useCalendar();

  return (
    <Providers rangeStart={rangeStart} rangeEnd={rangeEnd}>
      <BrowserRouter>
        <AppHeader />
        <StyledAppContainerDiv>
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
        </StyledAppContainerDiv>
      </BrowserRouter>
    </Providers>
  );
};

export default App;
