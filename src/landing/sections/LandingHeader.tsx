import { CustomButton } from '@components';

import ThemeToggle from '../../components/common/ThemeToggle';
import CtaLink from '../CtaLink';
import InfinityMark from '../InfinityMark';

const NAV_LINKS = [
  { href: '#views', label: 'Calendar' },
  { href: '#notes', label: 'Notes' },
  { href: '#metrics', label: 'Metrics' },
  { href: '#stocks', label: 'Stocks' },
  { href: '#costs', label: 'Costs' },
  { href: '#mcp', label: 'MCP' },
];

type LandingHeaderProps = {
  hasSession: boolean | null;
};

const LandingHeader = ({ hasSession }: LandingHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/80 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 justify-self-start">
          <InfinityMark className="h-4 w-auto overflow-visible" />
          <span className="text-lg font-extrabold">Habitrack</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            return (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-(--muted) hover:text-(--foreground)"
              >
                {link.label}
              </a>
            );
          })}
        </nav>
        {hasSession !== null && (
          <div className="landing-fade-in col-start-3 flex items-center gap-3 justify-self-end">
            <ThemeToggle />
            {hasSession ? (
              <CustomButton
                size="sm"
                data-discover="true"
                href="/calendar/month"
              >
                Calendar
              </CustomButton>
            ) : (
              <div className="flex items-center gap-2">
                <CtaLink size="sm" href="/login" variant="ghost">
                  Log In
                </CtaLink>
                <CtaLink size="sm" href="/register">
                  Join
                </CtaLink>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingHeader;
