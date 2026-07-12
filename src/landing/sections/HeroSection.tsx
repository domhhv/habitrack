import {
  GhostIcon,
  ArrowRightIcon,
  UserCirclePlusIcon,
} from '@phosphor-icons/react';

import { CustomButton } from '@components';

import CtaLink from '../CtaLink';
import { LiveMonthCalendar } from '../mockups';

type HeroSectionProps = {
  hasSession: boolean;
};

const HeroSection = ({ hasSession }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-6xl gap-12 space-y-4 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-12 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
          Habits, down to the{' '}
          <span className="text-(--accent)">last detail</span>.
        </h1>
        <div className="relative">
          <div aria-hidden className="landing-glow absolute -inset-10" />
          <div className="relative">
            <LiveMonthCalendar />
          </div>
        </div>
        {hasSession ? (
          <div className="flex items-start gap-4">
            <p className="max-w-xl text-lg text-(--muted)">
              Habitrack is a calendar-first habit tracker. Log anything you do,
              note it at any zoom level, measure it with metrics — and know
              exactly what it uses and what it costs.
            </p>
            <div className="hero-logged-in-ctas-container mt-4">
              <CtaLink href="/calendar">Open your calendar</CtaLink>
            </div>
          </div>
        ) : (
          <>
            <div className="hero-logged-out-ctas-container max-md:space-y-3">
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex w-full flex-col items-start gap-3 md:flex-row md:gap-6">
                  <p className="text-xl text-(--muted)">
                    Habitrack is a calendar-first habit tracker. Log anything
                    you do, note it at any zoom level, measure it with metrics —
                    and know exactly what it uses and what it costs.
                  </p>
                  <div className="flex gap-2 md:flex-col">
                    <CustomButton href="/register" className="md:w-full">
                      <UserCirclePlusIcon className="size-5" />
                      Join — it&apos;s free
                    </CustomButton>
                    <CustomButton href="/calendar" variant="outline">
                      Preview the full calendar
                      <ArrowRightIcon className="size-5" />
                    </CustomButton>
                  </div>
                </div>
              </div>
              <div>
                <CustomButton variant="secondary" href="/anonymous-login">
                  <GhostIcon className="size-5" />
                  Try it out anonymously
                </CustomButton>
                <p className="mt-2 text-sm font-semibold text-(--muted) md:mt-4">
                  Anonymous login is one click — no email, no password. Register
                  later to keep your data.
                </p>
              </div>
            </div>
            <div className="hero-logged-in-ctas-container hidden">
              <CustomButton href="/calendar">Open your calendar</CustomButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
