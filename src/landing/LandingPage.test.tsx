import { render, screen } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { hasBrowserSession } from '@utils';

import LandingPage from './LandingPage';

vi.mock('react-router', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    PrefetchPageLinks: ({ page }: { page: string }) => {
      return <link rel="prefetch" data-page={page} />;
    },
  };
});

vi.mock('@utils', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    hasBrowserSession: vi.fn(),
  };
});

vi.mock('./sections', () => {
  const Empty = () => {
    return null;
  };

  return {
    CalendarViewsSection: Empty,
    ExpensesSection: Empty,
    HeroSection: Empty,
    LandingFooter: Empty,
    McpSection: Empty,
    MetricsSection: Empty,
    NotesSection: Empty,
    StocksSection: Empty,
    AnonymousCtaSection: () => {
      return <p>Anonymous call to action</p>;
    },
    LandingHeader: ({ hasSession }: { hasSession: boolean | null }) => {
      if (hasSession === null) {
        return <p>Session unknown</p>;
      }

      return <p>{hasSession ? 'Signed in' : 'Signed out'}</p>;
    },
  };
});

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders no session-dependent actions until the session is known', () => {
    vi.mocked(hasBrowserSession).mockReturnValue(new Promise(() => {}));

    render(<LandingPage />);

    expect(screen.getByText('Session unknown')).toBeInTheDocument();
    expect(
      screen.queryByText('Anonymous call to action')
    ).not.toBeInTheDocument();
  });

  it('shows the signed-in actions once the browser session is found', async () => {
    vi.mocked(hasBrowserSession).mockResolvedValue(true);

    render(<LandingPage />);

    expect(await screen.findByText('Signed in')).toBeInTheDocument();
    expect(
      document.querySelector('link[data-page="/calendar/month"]')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Anonymous call to action')
    ).not.toBeInTheDocument();
  });

  it('shows the signed-out actions without a session', async () => {
    vi.mocked(hasBrowserSession).mockResolvedValue(false);

    render(<LandingPage />);

    expect(await screen.findByText('Signed out')).toBeInTheDocument();
    expect(document.querySelector('link[data-page]')).not.toBeInTheDocument();
    expect(screen.getByText('Anonymous call to action')).toBeInTheDocument();
  });
});
