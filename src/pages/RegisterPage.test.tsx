import { Toast } from '@heroui/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { signUp, convertAnonymousUser } from '@services';
import { makeRouteArgs } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/RegisterPage';
import { clientAction, clientLoader } from './RegisterPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    convertAnonymousUser: vi.fn(),
    signUp: vi.fn(),
  };
});

const REGISTER_URL = 'http://localhost/register';
const anonymousUser = { id: 'user-1', isAnonymous: true } as SessionUser;
const permanentUser = { id: 'user-2', isAnonymous: false } as SessionUser;

const submit = (user: SessionUser) => {
  const body = new FormData();
  body.set('email', 'me@email.com');
  body.set('password', 'password');
  body.set('firstDayOfWeek', 'sun');

  return clientAction(
    makeRouteArgs<Route.ClientActionArgs>(REGISTER_URL, user, {
      body,
      method: 'POST',
    })
  );
};

describe('RegisterPage clientLoader', () => {
  it('replaces the page for a permanent user', () => {
    let thrown: unknown;

    try {
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(REGISTER_URL, permanentUser)
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toBe('/');
    expect((thrown as Response).headers.has('X-Remix-Replace')).toBe(true);
  });

  it('marks anonymous users so the page offers to keep their data', () => {
    expect(
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(REGISTER_URL, anonymousUser)
      )
    ).toEqual({ isAnonymousUser: true });
    expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(REGISTER_URL))
    ).toEqual({ isAnonymousUser: false });
  });
});

describe('RegisterPage clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('converts an anonymous user and goes home', async () => {
    const result = (await submit(anonymousUser)) as Response;

    expect(convertAnonymousUser).toHaveBeenCalledWith(
      'me@email.com',
      'password'
    );
    expect(signUp).not.toHaveBeenCalled();
    expect(result.headers.get('Location')).toBe('/');
  });

  it('signs up a new user with the submitted first day of week', async () => {
    const result = (await submit(null)) as Response;

    expect(signUp).toHaveBeenCalledWith('me@email.com', 'password', 'sun');
    expect(result.headers.get('Location')).toBe('/login');
  });

  it('stays on the page and shows a toast when sign-up fails', async () => {
    const danger = vi.spyOn(Toast.toast, 'danger');
    vi.mocked(signUp).mockRejectedValue(new Error('Email taken'));

    await expect(submit(null)).resolves.toMatchObject({
      data: { error: 'Email taken' },
      init: { status: 400 },
    });
    expect(danger).toHaveBeenCalledOnce();
  });
});
