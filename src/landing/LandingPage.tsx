import React from 'react';

import './landing.css';
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

const LandingPage = () => {
  const [hasSession, setHasSession] = React.useState(false);

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
