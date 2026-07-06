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
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
      <LandingHeader />
      <main>
        <HeroSection />
        <CalendarViewsSection />
        <NotesSection />
        <MetricsSection />
        <StocksSection />
        <ExpensesSection />
        <McpSection />
        <AnonymousCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
