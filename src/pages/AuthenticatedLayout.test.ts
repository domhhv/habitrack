import { it, vi, expect, describe, beforeEach } from 'vitest';

import { getSessionClaims } from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import { middleware, clientMiddleware } from './AuthenticatedLayout';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    getSessionClaims: vi.fn(),
  };
});

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

const runServerGuard = () => {
  const [requireSession] = middleware;

  return runGuard(() => {
    return requireSession(
      makeRouteArgs<Parameters<typeof requireSession>[0]>(HABITS_URL),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lets a request with a verified session through', async () => {
    vi.mocked(getSessionClaims).mockResolvedValue({ sub: 'user-1' } as Awaited<
      ReturnType<typeof getSessionClaims>
    >);

    await expect(runServerGuard()).resolves.toBeNull();
    expect(getSessionClaims).toHaveBeenCalledWith(testSupabaseClient);
  });

  it('sends a signed-out request to the login page with a return path', async () => {
    vi.mocked(getSessionClaims).mockResolvedValue(null);

    expectLoginRedirect(await runServerGuard());
  });

  it('lets the request through when Supabase Auth cannot be reached', async () => {
    vi.mocked(getSessionClaims).mockRejectedValue(new Error('Failed to fetch'));

    await expect(runServerGuard()).resolves.toBeNull();
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
