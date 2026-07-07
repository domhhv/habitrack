import CtaLink from '../CtaLink';
import { MiniMonthCalendar } from '../mockups';

type HeroSectionProps = {
  hasSession: boolean;
};

const HeroSection = ({ hasSession }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
            Habits, down to the{' '}
            <span className="text-(--accent)">last detail</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-(--muted)">
            Habitrack is a calendar-first habit tracker. Log anything you do,
            note it at any zoom level, measure it with metrics — and know
            exactly what it uses and what it costs.
          </p>
          {hasSession ? (
            <div className="hero-logged-in-ctas-container mt-4">
              <CtaLink href="/calendar">Open your calendar</CtaLink>
            </div>
          ) : (
            <>
              <div className="hero-logged-out-ctas-container">
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <CtaLink href="/register">Join — it&apos;s free</CtaLink>
                  <CtaLink variant="secondary" href="/anonymous-login">
                    Look around anonymously
                  </CtaLink>
                  <CtaLink variant="ghost" href="/calendar">
                    Preview the calendar →
                  </CtaLink>
                </div>
                <p className="mt-4 text-sm font-semibold text-(--muted)">
                  Anonymous login is one click — no email, no password. Register
                  later to keep your data.
                </p>
              </div>
              <div className="hero-logged-in-ctas-container hidden">
                <CtaLink href="/calendar">Open your calendar</CtaLink>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <div aria-hidden className="landing-glow absolute -inset-10" />
          <div className="relative">
            <MiniMonthCalendar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
