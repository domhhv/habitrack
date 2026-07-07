import InfinityMark from '../InfinityMark';

const FOOTER_LINKS = [
  { href: 'https://github.com/domhhv/habitrack', label: 'GitHub' },
  { href: 'https://habitrack.featurebase.app/roadmap', label: 'Roadmap' },
  { href: '/login', label: 'Log In' },
  { href: '/register', label: 'Join' },
];

type LandingFooterProps = {
  hasSession: boolean;
};

const LandingFooter = ({ hasSession }: LandingFooterProps) => {
  return (
    <footer className="border-t border-(--border) py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <InfinityMark className="h-4 w-auto overflow-visible" />
          <span className="text-sm font-extrabold">Habitrack</span>
          <span className="text-sm font-semibold text-(--muted) max-[372px]:hidden">
            · habit tracking, down to the last detail
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-5">
          {FOOTER_LINKS.map((link) => {
            if (
              (link.label === 'Log In' || link.label === 'Join') &&
              hasSession
            ) {
              return null;
            }

            return (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold text-(--muted) hover:text-(--foreground)"
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </footer>
  );
};

export default LandingFooter;
