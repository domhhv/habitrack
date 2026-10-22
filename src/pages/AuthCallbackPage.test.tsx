import { it, vi, expect, describe, beforeEach } from 'vitest';

import { verifyEmailOtp, exchangeCodeForSession } from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';

import type { Route } from './+types/AuthCallbackPage';
import { loader } from './AuthCallbackPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    exchangeCodeForSession: vi.fn(),
    verifyEmailOtp: vi.fn(),
  };
});

const runLoader = async (search: string) => {
  try {
    return await loader(
      makeRouteArgs<Route.LoaderArgs>(
        `https://habitrack.test/auth/callback${search}`
      )
    );
  } catch (thrown) {
    return thrown;
  }
};

const expectRedirectTo = (result: unknown, location: string) => {
  expect(result).toBeInstanceOf(Response);
  expect((result as Response).status).toBe(302);
  expect((result as Response).headers.get('Location')).toBe(location);
};

describe('AuthCallbackPage loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exchangeCodeForSession).mockResolvedValue();
    vi.mocked(verifyEmailOtp).mockResolvedValue();
  });

  it('exchanges an OAuth code and goes to the next path', async () => {
    const result = await runLoader('?code=code-1&next=%2Fsettings');

    expect(exchangeCodeForSession).toHaveBeenCalledWith(
      testSupabaseClient,
      'code-1'
    );
    expectRedirectTo(result, '/settings');
  });

  it('goes to the calendar without a next path', async () => {
    expectRedirectTo(await runLoader('?code=code-1'), '/calendar');
  });

  it('verifies an email link and goes to its same-origin redirect URL', async () => {
    const result = await runLoader(
      '?token_hash=hash-1&type=recovery&next=https://habitrack.test/settings?passwordReset=true'
    );

    expect(verifyEmailOtp).toHaveBeenCalledWith(
      testSupabaseClient,
      'hash-1',
      'recovery'
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expectRedirectTo(result, '/settings?passwordReset=true');
  });

  it.each(['https://evil.test/settings', '//evil.test/settings'])(
    'ignores a next URL on another origin (%s)',
    async (next) => {
      const result = await runLoader(
        `?code=code-1&next=${encodeURIComponent(next)}`
      );

      expectRedirectTo(result, '/calendar');
    }
  );

  it('shows the provider error without exchanging anything', async () => {
    const result = await runLoader(
      '?error=access_denied&error_description=Identity+is+already+linked'
    );

    expect(result).toMatchObject({
      data: { error: 'Identity is already linked' },
      init: { status: 400 },
    });
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('shows the error when the code exchange fails', async () => {
    vi.mocked(exchangeCodeForSession).mockRejectedValue(
      new Error('Invalid code verifier')
    );

    expect(await runLoader('?code=code-1')).toMatchObject({
      data: { error: 'Invalid code verifier' },
      init: { status: 400 },
    });
  });

  it.each(['', '?token_hash=hash-1', '?token_hash=hash-1&type=sms'])(
    'rejects an incomplete link (%s)',
    async (search) => {
      expect(await runLoader(search)).toMatchObject({
        data: { error: 'This link is incomplete. Please request a new one.' },
        init: { status: 400 },
      });
      expect(verifyEmailOtp).not.toHaveBeenCalled();
    }
  );
});
