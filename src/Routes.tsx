import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router';

import {
  LoginPage,
  NotesPage,
  HabitsPage,
  RegisterPage,
  SettingsPage,
  DayCalendarPage,
  OAuthConsentPage,
  HabitDetailsPage,
  WeekCalendarPage,
  MonthCalendarPage,
  ResetPasswordPage,
  AnonymousLoginPage,
} from '@pages';

const AccountRedirect = () => {
  const { hash, search } = useLocation();

  return <Navigate replace to={`/settings${search}${hash}`} />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        element={<MonthCalendarPage />}
        path="/calendar/month/:year?/:month?/:day?"
      />
      <Route
        element={<DayCalendarPage />}
        path="/calendar/day/:year?/:month?/:day?"
      />
      <Route
        element={<WeekCalendarPage />}
        path="/calendar/week/:year?/:month?/:day?"
      />
      <Route path="/habits" element={<HabitsPage />} />
      <Route path="/habits/:habitId" element={<HabitDetailsPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/account" element={<AccountRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/anonymous-login" element={<AnonymousLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth/consent" element={<OAuthConsentPage />} />
      <Route path="*" element={<Navigate replace to="/calendar/month" />} />
    </Routes>
  );
};

export default AppRoutes;
