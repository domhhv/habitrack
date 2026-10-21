import type { UserIdentity } from '@supabase/supabase-js';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import {
  deleteUser,
  updateUser,
  patchProfile,
  unlinkIdentity,
  getUserIdentities,
} from '@services';
import { makeRouteArgs } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/SettingsPage';
import { clientAction, clientLoader } from './SettingsPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    deleteUser: vi.fn(),
    getUserIdentities: vi.fn(),
    linkGoogleIdentity: vi.fn(),
    patchProfile: vi.fn(),
    unlinkIdentity: vi.fn(),
    updateUser: vi.fn(),
  };
});

const SETTINGS_URL = 'http://localhost/settings';
const user = { email: 'new@email.com', id: 'user-1' } as SessionUser;
const googleIdentity = {
  identity_id: 'identity-google',
  provider: 'google',
} as UserIdentity;

const submit = (fields: Record<string, string>, sessionUser = user) => {
  const body = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    body.set(key, value);
  });

  return clientAction(
    makeRouteArgs<Route.ClientActionArgs>(SETTINGS_URL, sessionUser, {
      body,
      method: 'POST',
    })
  );
};

describe('SettingsPage clientLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips identities for signed-out users', async () => {
    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(SETTINGS_URL))
    ).resolves.toEqual({ identities: [], identitiesError: null });
    expect(getUserIdentities).not.toHaveBeenCalled();
  });

  it('returns the connected identities', async () => {
    vi.mocked(getUserIdentities).mockResolvedValue([googleIdentity]);

    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(SETTINGS_URL, user))
    ).resolves.toEqual({ identities: [googleIdentity], identitiesError: null });
  });

  it('keeps the page usable when identities fail to load', async () => {
    vi.mocked(getUserIdentities).mockRejectedValue(new Error('Offline'));

    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(SETTINGS_URL, user))
    ).resolves.toEqual({ identities: [], identitiesError: 'Offline' });
  });
});

describe('SettingsPage clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unknown intents and signed-out users', async () => {
    await expect(submit({ intent: 'toString' })).resolves.toMatchObject({
      init: { status: 400 },
    });
    await expect(
      submit({ intent: 'update-profile' }, null)
    ).resolves.toMatchObject({ init: { status: 400 } });
    expect(patchProfile).not.toHaveBeenCalled();
  });

  it('patches only the submitted profile fields', async () => {
    await expect(
      submit({ firstDayOfWeek: 'sun', intent: 'update-profile', name: 'Dom' })
    ).resolves.toEqual({ intent: 'update-profile', ok: true });
    expect(patchProfile).toHaveBeenCalledWith('user-1', {
      firstDayOfWeek: 'sun',
      name: 'Dom',
    });
  });

  it('updates the auth user with the submitted email and password', async () => {
    await submit({
      email: 'me@email.com',
      intent: 'update-user',
      password: 'secret',
    });

    expect(updateUser).toHaveBeenCalledWith({
      email: 'me@email.com',
      password: 'secret',
    });
  });

  it('syncs the confirmed email from the session to the profile', async () => {
    await submit({ intent: 'sync-email' });

    expect(patchProfile).toHaveBeenCalledWith('user-1', {
      email: 'new@email.com',
    });
  });

  it('deletes the account and goes to login', async () => {
    const result = (await submit({ intent: 'delete-account' })) as Response;

    expect(deleteUser).toHaveBeenCalledOnce();
    expect(result.headers.get('Location')).toBe('/login');
  });

  it('unlinks the submitted identity', async () => {
    vi.mocked(getUserIdentities).mockResolvedValue([googleIdentity]);

    await submit({
      identityId: 'identity-google',
      intent: 'unlink-identity',
    });

    expect(unlinkIdentity).toHaveBeenCalledWith(googleIdentity);
  });

  it('returns the error when the identity is no longer connected', async () => {
    vi.mocked(getUserIdentities).mockResolvedValue([]);

    await expect(
      submit({ identityId: 'identity-google', intent: 'unlink-identity' })
    ).resolves.toMatchObject({
      init: { status: 400 },
      data: {
        error: 'This account is no longer connected',
        intent: 'unlink-identity',
        ok: false,
      },
    });
    expect(unlinkIdentity).not.toHaveBeenCalled();
  });
});
