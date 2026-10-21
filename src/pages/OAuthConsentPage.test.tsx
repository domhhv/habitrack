import { it, vi, expect, describe, beforeEach } from 'vitest';

import { decideAuthorization, getAuthorizationDetails } from '@services';
import { makeRouteArgs } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/OAuthConsentPage';
import { clientAction, clientLoader } from './OAuthConsentPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    decideAuthorization: vi.fn(),
    getAuthorizationDetails: vi.fn(),
  };
});

const CONSENT_URL = 'http://localhost/oauth/consent?authorization_id=auth-1';
const user = { id: 'user-1' } as SessionUser;

const catchThrown = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (thrown) {
    return thrown;
  }

  throw new Error('Expected the promise to throw');
};

describe('OAuthConsentPage clientLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a request without authorization_id', async () => {
    const thrown = await catchThrown(
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(
          'http://localhost/oauth/consent',
          user
        )
      )
    );

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect(getAuthorizationDetails).not.toHaveBeenCalled();
  });

  it('sends signed-out users to settings with a return path', async () => {
    const thrown = await catchThrown(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(CONSENT_URL))
    );

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toBe(
      `/settings?returnTo=${encodeURIComponent('/oauth/consent?authorization_id=auth-1')}`
    );
  });

  it('reloads the document to the client when consent was already given', async () => {
    vi.mocked(getAuthorizationDetails).mockResolvedValue({
      redirect_url: 'cursor://callback?code=1',
    } as Awaited<ReturnType<typeof getAuthorizationDetails>>);

    const thrown = (await catchThrown(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(CONSENT_URL, user))
    )) as Response;

    expect(thrown.headers.get('Location')).toBe('cursor://callback?code=1');
    expect(thrown.headers.has('X-Remix-Reload-Document')).toBe(true);
  });

  it('returns the authorization details to render', async () => {
    const details = { client: { name: 'Client' }, scope: 'email' };
    vi.mocked(getAuthorizationDetails).mockResolvedValue(
      details as Awaited<ReturnType<typeof getAuthorizationDetails>>
    );

    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(CONSENT_URL, user))
    ).resolves.toEqual({ details });
    expect(getAuthorizationDetails).toHaveBeenCalledWith('auth-1');
  });
});

describe('OAuthConsentPage clientAction', () => {
  const submit = (decision: string) => {
    const body = new FormData();
    body.set('decision', decision);

    return clientAction(
      makeRouteArgs<Route.ClientActionArgs>(CONSENT_URL, user, {
        body,
        method: 'POST',
      })
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reloads the document to the redirect URL of the decision', async () => {
    vi.mocked(decideAuthorization).mockResolvedValue('https://client/cb');

    const result = (await submit('approve')) as Response;

    expect(decideAuthorization).toHaveBeenCalledWith('auth-1', true);
    expect(result.headers.get('Location')).toBe('https://client/cb');
    expect(result.headers.has('X-Remix-Reload-Document')).toBe(true);
  });

  it('denies when the deny button submits', async () => {
    vi.mocked(decideAuthorization).mockResolvedValue('https://client/cb');

    await submit('deny');

    expect(decideAuthorization).toHaveBeenCalledWith('auth-1', false);
  });

  it('returns the error inline when the decision fails', async () => {
    vi.mocked(decideAuthorization).mockRejectedValue(new Error('Expired'));

    await expect(submit('approve')).resolves.toMatchObject({
      data: { error: 'Expired' },
      init: { status: 400 },
    });
  });
});
