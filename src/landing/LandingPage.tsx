import React from 'react';
import { data } from 'react-router';

import { preferences } from '@utils';

import './landing.css';
import type { Route } from './+types/LandingPage';
import {
  McpSection,
  HeroSection,
  NotesSection,
  StocksSection,
  LandingFooter,
  LandingHeader,
  MetricsSection,
  ExpensesSection,
  AnonymousCtaSection,
  CalendarViewsSection,
} from './sections';

// read the state from the cookie
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await preferences.parse(cookieHeader)) || {};
  console.log('LandingPage loader: cookie =', cookie);

  return data({
    isSystemDark: cookie.isSystemDark,
    themeMode: cookie.themeMode,
  });
}

// write the state to the cookie
export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await preferences.parse(cookieHeader)) || {};
  const formData = await request.formData();

  const themeMode = formData.get('themeMode');
  const isSystemDark = formData.get('isSystemDark');
  cookie.themeMode = themeMode;
  cookie.isSystemDark = isSystemDark;

  return data(
    { isSystemDark, themeMode },
    {
      headers: {
        'Set-Cookie': await preferences.serialize(cookie),
      },
    }
  );
}

const LandingPage = ({ loaderData }: Route.ComponentProps) => {
  console.log('LandingPage render: loaderData =', loaderData);
  /*
   * The page is prerendered with renderToString at build time, where
   * localStorage does not exist, and then hydrated in the browser. The
   * session check runs after hydration so the server and client render
   * the same logged-out markup initially.
   */
  const [hasSession, setHasSession] = React.useState(false);

  const resolvedThemeMode = React.useMemo(() => {
    if (loaderData.themeMode === 'system') {
      return loaderData.isSystemDark === 'true' ? 'dark' : 'light';
    }

    return loaderData.themeMode;
  }, [loaderData.themeMode, loaderData.isSystemDark]);

  React.useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      resolvedThemeMode === 'dark'
    );
  }, [resolvedThemeMode]);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaQueryListChange = (e: MediaQueryListEvent) => {
      if (loaderData.themeMode === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        cookieStore.set('isSystemDark', e.matches.toString());
      }
    };

    mediaQueryList.addEventListener('change', handleMediaQueryListChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleMediaQueryListChange);
    };
  }, [loaderData.themeMode]);

  React.useEffect(() => {
    setHasSession(
      Object.keys(localStorage).some(function (key) {
        return key.startsWith('sb-') && key.endsWith('-auth-token');
      })
    );
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen antialiased">
      <LandingHeader hasSession={hasSession} />
      <main>
        <HeroSection hasSession={hasSession} />
        <CalendarViewsSection />
        <NotesSection />
        <MetricsSection />
        <StocksSection />
        <ExpensesSection />
        <McpSection />
        {!hasSession && <AnonymousCtaSection />}
      </main>
      <LandingFooter hasSession={hasSession} />
    </div>
  );
};

export default LandingPage;
