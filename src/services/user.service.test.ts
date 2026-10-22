import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { it, vi, expect, describe } from 'vitest';

import type { TypedSupabaseClient } from '@models';

import { getSession, getSessionUser, getSessionClaims } from './user.service';

const makeClient = (result: { data: unknown; error: unknown }) => {
  return {
    auth: { getClaims: vi.fn().mockResolvedValue(result) },
  } as unknown as TypedSupabaseClient;
};

describe('getSessionClaims', () => {
  it('returns the verified claims of the session', async () => {
    const claims = { sub: 'user-1' };

    await expect(
      getSessionClaims(makeClient({ data: { claims }, error: null }))
    ).resolves.toBe(claims);
  });

  it.each([
    { data: null, error: null },
    { data: null, error: new AuthApiError('Invalid JWT', 401, 'bad_jwt') },
  ])('returns null without a valid session', async (result) => {
    await expect(getSessionClaims(makeClient(result))).resolves.toBeNull();
  });

  it('throws when Supabase Auth cannot be reached', async () => {
    await expect(
      getSessionClaims(
        makeClient({
          data: null,
          error: new AuthRetryableFetchError('Failed to fetch', 0),
        })
      )
    ).rejects.toThrow('Failed to fetch');
  });
});

describe('getSession', () => {
  it("keeps only the session user's id, email and anonymity", async () => {
    const supabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          error: null,
          data: {
            session: {
              user: {
                email: 'me@email.com',
                id: 'user-1',
                is_anonymous: false,
                user_metadata: { name: 'Me' },
              },
            },
          },
        }),
      },
    } as unknown as TypedSupabaseClient;

    await expect(getSession(supabase)).resolves.toEqual({
      email: 'me@email.com',
      id: 'user-1',
      isAnonymous: false,
    });
  });
});

describe('getSessionUser', () => {
  it('builds the same user shape from the verified claims', async () => {
    await expect(
      getSessionUser(
        makeClient({
          data: { claims: { is_anonymous: true, sub: 'user-1' } },
          error: null,
        })
      )
    ).resolves.toEqual({ email: undefined, id: 'user-1', isAnonymous: true });
  });

  it('is null without a session', async () => {
    await expect(
      getSessionUser(makeClient({ data: null, error: null }))
    ).resolves.toBeNull();
  });
});
