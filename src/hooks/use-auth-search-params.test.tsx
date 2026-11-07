import { Toast } from '@heroui/react';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { Outlet, useLocation, createRoutesStub } from 'react-router';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import useAuthSearchParams from './use-auth-search-params';

const renderSettings = (url: string) => {
  const settingsLoader = vi.fn(() => {
    return null;
  });

  const Settings = () => {
    useAuthSearchParams();
    const { search } = useLocation();

    return <p data-testid="search">{search || 'none'}</p>;
  };

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      loader: () => {
        return { profile: null, user: null };
      },
      children: [
        { Component: Settings, loader: settingsLoader, path: '/settings' },
      ],
    },
  ]);

  return { settingsLoader, ...render(<Stub initialEntries={[url]} />) };
};

describe(useAuthSearchParams.name, () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves the URL and the loaders alone without auth search params', async () => {
    const { findByTestId, settingsLoader } = renderSettings('/settings');

    expect((await findByTestId('search')).textContent).toBe('none');
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(settingsLoader).toHaveBeenCalledOnce();
  });

  it('shows the toast for the auth search param and then clears it', async () => {
    const success = vi.spyOn(Toast.toast, 'success');
    const { findByTestId } = renderSettings('/settings?passwordReset=true');

    await waitFor(async () => {
      expect((await findByTestId('search')).textContent).toBe('none');
    });
    expect(success).toHaveBeenCalledWith(`You're now logged in to Habitrack`, {
      description: 'You can update your password on this page',
    });
  });
});
