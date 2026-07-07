import React from 'react';

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
  /*
   * The page is prerendered with renderToString at build time, where
   * localStorage does not exist, and then hydrated in the browser. The
   * session check runs after hydration so the server and client render
   * the same logged-out markup initially.
   */
  const [hasSession, setHasSession] = React.useState(false);

  React.useEffect(() => {
    setHasSession(
      Object.keys(localStorage).some(function (key) {
        return key.startsWith('sb-') && key.endsWith('-auth-token');
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
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
