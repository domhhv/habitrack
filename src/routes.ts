import {
  index,
  route,
  layout,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  index('landing/LandingPage.tsx'),
  layout('App.tsx', { id: 'app' }, [
    route('calendar', 'pages/CalendarLayout.tsx', { id: 'calendar' }, [
      route('month/:year?/:month?/:day?', 'pages/MonthCalendarPage.tsx', {
        id: 'calendar-month',
      }),
      route('week/:year?/:month?/:day?', 'pages/WeekCalendarPage.tsx', {
        id: 'calendar-week',
      }),
      route('day/:year?/:month?/:day?', 'pages/DayCalendarPage.tsx', {
        id: 'calendar-day',
      }),
    ]),
    route('habits', 'pages/HabitsPage.tsx', { id: 'habits' }),
    route('habits/:habitId', 'pages/HabitDetailsPage.tsx', {
      id: 'habit-details',
    }),
    route('notes', 'pages/NotesPage.tsx', { id: 'notes' }),
    route('settings', 'pages/SettingsPage.tsx', { id: 'settings' }),
    route('account', 'pages/AccountRedirect.tsx', { id: 'account' }),
    route('login', 'pages/LoginPage.tsx', { id: 'login' }),
    route('anonymous-login', 'pages/AnonymousLoginPage.tsx', {
      id: 'anonymous-login',
    }),
    route('register', 'pages/RegisterPage.tsx', { id: 'register' }),
    route('reset-password', 'pages/ResetPasswordPage.tsx', {
      id: 'reset-password',
    }),
    route('oauth/consent', 'pages/OAuthConsentPage.tsx', {
      id: 'oauth-consent',
    }),
    route('resources/notes', 'routes/resources/notes.ts', {
      id: 'resources-notes',
    }),
    route('resources/occurrences', 'routes/resources/occurrences.ts', {
      id: 'resources-occurrences',
    }),
    route('*', 'pages/FallbackRedirect.tsx', { id: 'fallback' }),
  ]),
] satisfies RouteConfig;
