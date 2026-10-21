import type { UserIdentity } from '@supabase/supabase-js';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import ConnectedAccounts from './ConnectedAccounts';

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

  it('submits a link request when Google is not connected', async () => {
    const { action, findByTestId } = renderAccounts([]);

    fireEvent.click(await findByTestId('link-google-button'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({ intent: 'link-identity' });
    });
  });
});
