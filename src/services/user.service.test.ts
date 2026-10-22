import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { it, vi, expect, describe } from 'vitest';

import type { TypedSupabaseClient } from '@models';

import { getSessionClaims } from './user.service';

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
