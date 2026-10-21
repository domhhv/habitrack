import { it, vi, expect, describe, beforeEach } from 'vitest';

import { signIn } from '@services';
import { makeRouteArgs } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/LoginPage';
import { clientAction, clientLoader } from './LoginPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    signIn: vi.fn(),
  };
});

const LOGIN_URL = 'http://localhost/login';

const submit = () => {
  const body = new FormData();
  body.set('email', 'me@email.com');
  body.set('password', 'password');

  return clientAction(
    makeRouteArgs<Route.ClientActionArgs>(LOGIN_URL, null, {
      body,
      method: 'POST',
    })
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('replaces the page for a signed-in user', () => {
    expect(() => {
      return clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(LOGIN_URL, {
          id: 'user-1',
        } as SessionUser)
      );
    }).toThrow(Response);
    expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(LOGIN_URL))
    ).toBeNull();
  });

  it('signs in with the submitted credentials and goes to the calendar', async () => {
    const result = (await submit()) as Response;

    expect(signIn).toHaveBeenCalledWith('me@email.com', 'password');
    expect(result.headers.get('Location')).toBe('/calendar');
  });

  it('stays on the page when signing in fails', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('Invalid credentials'));

    await expect(submit()).resolves.toMatchObject({
      data: { error: 'Invalid credentials' },
      init: { status: 400 },
    });
  });
});
