import { it, vi, expect, describe, beforeEach } from 'vitest';

import { signInAnonymously } from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/AnonymousLoginPage';
import { clientAction, clientLoader } from './AnonymousLoginPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    signInAnonymously: vi.fn(),
  };
});

const ANONYMOUS_LOGIN_URL = 'http://localhost/anonymous-login';

describe('AnonymousLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a signed-in user to the calendar', () => {
    let thrown: unknown;

    try {
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(ANONYMOUS_LOGIN_URL, {
          id: 'user-1',
        } as SessionUser)
      );
    } catch (error) {
      thrown = error;
    }

    expect((thrown as Response).headers.get('Location')).toBe('/calendar');
  });

  it('signs in anonymously and goes to the calendar', async () => {
    const body = new FormData();
    body.set('firstDayOfWeek', 'sun');

    const result = (await clientAction(
      makeRouteArgs<Route.ClientActionArgs>(ANONYMOUS_LOGIN_URL, null, {
        body,
        method: 'POST',
      })
    )) as Response;

    expect(signInAnonymously).toHaveBeenCalledWith(testSupabaseClient, 'sun');
    expect(result.headers.get('Location')).toBe('/calendar');
  });

  it('goes back to the page that asked for a login', async () => {
    const body = new FormData();
    body.set('firstDayOfWeek', 'sun');

    const result = (await clientAction(
      makeRouteArgs<Route.ClientActionArgs>(
        `${ANONYMOUS_LOGIN_URL}?returnTo=%2Fhabits`,
        null,
        { body, method: 'POST' }
      )
    )) as Response;

    expect(result.headers.get('Location')).toBe('/habits');
  });
});
