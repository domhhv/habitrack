import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import UserMenu from './UserMenu';

vi.mock('react-router', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    PrefetchPageLinks: ({ page }: { page: string }) => {
      return <link rel="prefetch" data-page={page} />;
    },
  };
});

vi.mock('@hooks', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    useProfile: vi.fn().mockReturnValue({ email: 'me@example.test' }),
    useUser: vi.fn().mockReturnValue({ id: 'user-1' }),
  };
});

vi.mock('@services', () => {
  return { signOut: vi.fn() };
});

vi.mock('@stores', () => {
  return {
    useMobileSidebarActions: vi
      .fn()
      .mockReturnValue({ closeMobileSidebar: vi.fn() }),
  };
});

describe('UserMenu', () => {
  it('prefetches the settings page once the menu opens', async () => {
    const onOpenChange = vi.fn();
    const Stub = createRoutesStub([
      {
        path: '/calendar',
        Component: () => {
          return <UserMenu isExpanded onOpenChange={onOpenChange} />;
        },
      },
    ]);
    const { container } = render(<Stub initialEntries={['/calendar']} />);

    fireEvent.click(await screen.findByLabelText('Open account menu'));

    expect(await screen.findByText('Settings')).toBeInTheDocument();
    expect(
      container.ownerDocument.querySelector('link[data-page="/settings"]')
    ).not.toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('prefetches nothing while the menu is closed', async () => {
    const Stub = createRoutesStub([
      {
        path: '/calendar',
        Component: () => {
          return <UserMenu isExpanded />;
        },
      },
    ]);
    render(<Stub initialEntries={['/calendar']} />);

    expect(await screen.findByLabelText('Open account menu')).toBeVisible();
    expect(document.querySelector('link[data-page="/settings"]')).toBeNull();
  });
});
