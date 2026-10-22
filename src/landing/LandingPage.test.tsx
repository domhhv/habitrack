import { render, screen } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { hasBrowserSession } from '@utils';

import LandingPage from './LandingPage';

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
    LandingHeader: ({ hasSession }: { hasSession: boolean }) => {
      return <p>{hasSession ? 'Signed in' : 'Signed out'}</p>;
    },
  };
});

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('switches to the signed-in actions once the browser session is found', async () => {
    vi.mocked(hasBrowserSession).mockResolvedValue(true);

    render(<LandingPage />);

    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(await screen.findByText('Signed in')).toBeInTheDocument();
    expect(
      screen.queryByText('Anonymous call to action')
    ).not.toBeInTheDocument();
  });

  it('keeps the signed-out actions without a session', async () => {
    vi.mocked(hasBrowserSession).mockResolvedValue(false);

    render(<LandingPage />);

    await vi.waitFor(() => {
      expect(hasBrowserSession).toHaveBeenCalledOnce();
    });
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(screen.getByText('Anonymous call to action')).toBeInTheDocument();
  });
});
