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

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await preferences.parse(cookieHeader)) || {};

  return data({
    isSystemDark: cookie.isSystemDark,
    themeMode: cookie.themeMode,
  });
}

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

    const handleMediaQueryListChange = (
      e: MediaQueryListEvent | MediaQueryList = mediaQueryList
    ) => {
      if (!loaderData.themeMode || loaderData.themeMode === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';

        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        cookieStore.set('isSystemDark', e.matches.toString());
        cookieStore.set('themeMode', 'system');
      }
    };

    mediaQueryList.addEventListener('change', handleMediaQueryListChange);

    handleMediaQueryListChange();

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
    <>
      <meta charSet="utf-8" />
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="icon"
        sizes="32x32"
        type="image/png"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        sizes="16x16"
        type="image/png"
        href="/favicon-16x16.png"
      />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Habitrack — habit tracking down to the last detail</title>
      <meta
        name="description"
        content="A calendar-first habit tracker with month, week, and day views. Log habits, scope notes to any period, measure with custom metrics, keep stock of the items habits consume, and track what every habit costs. Try it anonymously in one click."
      />
      <link rel="canonical" href="https://www.habitrack.io/" />
      <meta content="website" property="og:type" />
      <meta property="og:url" content="https://www.habitrack.io/" />
      <meta
        property="og:title"
        content="Habitrack — habit tracking down to the last detail"
      />
      <meta
        property="og:description"
        content="Calendar-based habit tracking with custom metrics, stock keeping, expense tracking, scoped notes, and a built-in MCP server for AI assistants. Log in anonymously to look around."
      />
      <meta
        property="og:image"
        content="https://www.habitrack.io/android-chrome-512x512.png"
      />
      <meta content="summary" name="twitter:card" />
      <meta
        name="twitter:title"
        content="Habitrack — habit tracking down to the last detail"
      />
      <meta
        name="twitter:description"
        content="Calendar-based habit tracking with custom metrics, stock keeping, expense tracking, scoped notes, and a built-in MCP server for AI assistants."
      />
      {/*<script type="application/ld+json">*/}
      {/*  {*/}
      {/*    "@context": "https://schema.org",*/}
      {/*    "@type": "SoftwareApplication",*/}
      {/*    "name": "Habitrack",*/}
      {/*    "url": "https://www.habitrack.io/",*/}
      {/*    "applicationCategory": "LifestyleApplication",*/}
      {/*    "operatingSystem": "Web",*/}
      {/*    "description": "A calendar-first habit tracker with custom metrics, stock keeping, per-habit expense tracking, scoped notes, and a built-in MCP server for AI assistants.",*/}
      {/*    "offers": {*/}
      {/*      "@type": "Offer",*/}
      {/*      "price": "0",*/}
      {/*      "priceCurrency": "USD"*/}
      {/*    }*/}
      {/*  }*/}
      {/*</script>*/}
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
    </>
  );
};

export default LandingPage;
