import type { UserIdentity } from '@supabase/supabase-js';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import { linkGoogleIdentity } from '@services';

import ConnectedAccounts from './ConnectedAccounts';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    linkGoogleIdentity: vi.fn().mockResolvedValue(undefined),
  };
});

const renderAccounts = (identities: UserIdentity[], loadError = null) => {
  const action = vi.fn().mockReturnValue(null);
  const Stub = createRoutesStub([
    {
      path: '/settings',
      action: async ({ request }) => {
        return action(Object.fromEntries(await request.formData()));
      },
      Component: () => {
        return (
          <ConnectedAccounts loadError={loadError} identities={identities} />
        );
      },
    },
  ]);

  return { action, ...render(<Stub initialEntries={['/settings']} />) };
};

describe(ConnectedAccounts.name, () => {
  it('submits the Google identity id to unlink it', async () => {
    const { action, findByTestId } = renderAccounts([
      { identity_id: 'identity-google', provider: 'google' } as UserIdentity,
      { identity_id: 'identity-email', provider: 'email' } as UserIdentity,
    ]);

    fireEvent.click(await findByTestId('unlink-google-button'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({
        identityId: 'identity-google',
        intent: 'unlink-identity',
      });
    });
  });

  it('links Google in the browser without submitting to the action', async () => {
    const { action, findByTestId } = renderAccounts([]);

    fireEvent.click(await findByTestId('link-google-button'));

    await waitFor(() => {
      expect(linkGoogleIdentity).toHaveBeenCalledWith(
        expect.anything(),
        window.location.origin
      );
    });
    expect(action).not.toHaveBeenCalled();
  });
});
