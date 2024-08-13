import { AppHeader, Calendar, AccountPage, HabitsPage } from '@components';
import {
  UserAccountProvider,
  HabitsProvider,
  OccurrencesProvider,
  SnackbarProvider,
  TraitsProvider,
} from '@context';
import { supabaseClient, theme } from '@helpers';
import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import { GregorianCalendar } from '@internationalized/date';
import { CssVarsProvider } from '@mui/joy';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { generateCalendarRange } from '@utils';
import React from 'react';
import { useLocale } from 'react-aria';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useCalendarState } from 'react-stately';

import { StyledAppContainerDiv } from './styled';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();
    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const App = () => {
  const { locale } = useLocale();
  const state = useCalendarState({
    locale,
    createCalendar,
  });
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);
  const weeks = [...new Array(weeksInMonth).keys()];
  const { rangeStart, rangeEnd } = generateCalendarRange(
    state.getDatesInWeek(0) as CalendarDate[],
    state.getDatesInWeek(weeks[weeks.length - 1]) as CalendarDate[]
  );

  return (
    <CssVarsProvider defaultMode="system" theme={theme}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <SnackbarProvider>
          <UserAccountProvider>
            <TraitsProvider>
              <HabitsProvider>
                <OccurrencesProvider
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                >
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
                        <Route
                          path="*"
                          element={<Navigate to="/calendar" replace />}
                        />
                      </Routes>
                    </StyledAppContainerDiv>
                  </BrowserRouter>
                </OccurrencesProvider>
              </HabitsProvider>
            </TraitsProvider>
          </UserAccountProvider>
        </SnackbarProvider>
      </SessionContextProvider>
    </CssVarsProvider>
  );
};

export default App;
