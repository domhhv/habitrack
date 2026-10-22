import { it, vi, expect, describe } from 'vitest';

import { makeRouteArgs } from '@tests';
import type { SessionUser } from '@utils';

import { middleware, clientMiddleware } from './AuthenticatedLayout';

const HABITS_URL = 'https://habitrack.test/habits?sort=name';
const LOGIN_PATH = `/login?returnTo=${encodeURIComponent('/habits?sort=name')}`;

const runGuard = async (guard: () => unknown) => {
  try {
    await guard();
  } catch (thrown) {
    return thrown;
  }

  return null;
};

const runServerGuard = (user: SessionUser) => {
  const [requireSession] = middleware;

  return runGuard(() => {
    return requireSession(
      makeRouteArgs<Parameters<typeof requireSession>[0]>(HABITS_URL, user),
      vi.fn()
    );
  });
};

const runClientGuard = (user: SessionUser) => {
  const [requireUser] = clientMiddleware;

  return runGuard(() => {
    return requireUser(
      makeRouteArgs<Parameters<typeof requireUser>[0]>(HABITS_URL, user),
      vi.fn()
    );
  });
};

const expectLoginRedirect = (thrown: unknown) => {
  expect(thrown).toBeInstanceOf(Response);
  expect((thrown as Response).headers.get('Location')).toBe(LOGIN_PATH);
};

describe('AuthenticatedLayout server middleware', () => {
  it('lets a request with a verified user through', async () => {
    await expect(
      runServerGuard({ id: 'user-1' } as SessionUser)
    ).resolves.toBeNull();
  });

  it('sends a signed-out request to the login page with a return path', async () => {
    expectLoginRedirect(await runServerGuard(null));
  });
});

describe('AuthenticatedLayout client middleware', () => {
  it('lets a signed-in user through', async () => {
    await expect(
      runClientGuard({ id: 'user-1' } as SessionUser)
    ).resolves.toBeNull();
  });

  it('sends a signed-out user to the login page with a return path', async () => {
    expectLoginRedirect(await runClientGuard(null));
  });
});
