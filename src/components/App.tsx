import { AppHeader, Calendar, AccountPage, HabitsPage } from '@components';
import {
  UserAccountProvider,
  HabitsProvider,
  OccurrencesProvider,
  SnackbarProvider,
  TraitsProvider,
} from '@context';
import { supabaseClient, theme } from '@helpers';
import { USER_THEME_STORAGE_KEY } from '@hooks';
import {
  type CalendarDate,
  createCalendar,
  getWeeksInMonth,
} from '@internationalized/date';
import { CssVarsProvider, styled } from '@mui/joy';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { generateCalendarRange } from '@utils';
import React from 'react';
import { useLocale } from 'react-aria';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useCalendarState } from 'react-stately';

const StyledAppContainerDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '1 1 0%',
  [theme.getColorSchemeSelector('light')]: {
    backgroundColor: theme.palette.neutral[100],
  },
  [theme.getColorSchemeSelector('dark')]: {
    backgroundColor: theme.palette.neutral[800],
  },
});

const App = () => {
  const { locale } = useLocale();
  const state = useCalendarState({
    locale,
    createCalendar,
  });
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);
  const weeks = [...new Array(weeksInMonth).keys()];
  const range = generateCalendarRange(
    state.getDatesInWeek(0) as CalendarDate[],
    state.getDatesInWeek(weeks[weeks.length - 1]) as CalendarDate[]
  );

  return (
    <CssVarsProvider
      defaultMode="light"
      theme={theme}
      modeStorageKey={USER_THEME_STORAGE_KEY}
    >
      <SessionContextProvider supabaseClient={supabaseClient}>
        <SnackbarProvider>
          <UserAccountProvider>
            <TraitsProvider>
              <HabitsProvider>
                <OccurrencesProvider range={range}>
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

export default hot(App);
