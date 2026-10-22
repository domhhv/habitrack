import {
  AuthSessionMissingError,
  AuthRetryableFetchError,
} from '@supabase/supabase-js';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

const { createBrowserClient, rollbarError } = vi.hoisted(() => {
  return { createBrowserClient: vi.fn(), rollbarError: vi.fn() };
});

vi.mock('@supabase/ssr', () => {
  return { createBrowserClient };
});

vi.mock('./rollbar', () => {
  return { default: { error: rollbarError } };
});

const LEGACY_SESSION_KEY = 'sb-test-project-auth-token';

const storedSession = JSON.stringify({
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  user: { id: 'user-1' },
});

const makeClient = ({
  session = null,
  setSessionError = null,
}: {
  session?: object | null;
  setSessionError?: Error | null;
} = {}) => {
  const client = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      setSession: vi.fn().mockResolvedValue({
        data: { session: null, user: null },
        error: setSessionError,
      }),
    },
  };

  createBrowserClient.mockReturnValue(client);

  return client;
};

const importClientModule = () => {
  return import('./supabase-client');
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('loadSupabaseBrowserClient', () => {
  it('creates the cookie client with the project URL and publishable key', async () => {
    const client = makeClient();
    const { loadSupabaseBrowserClient } = await importClientModule();

    await expect(loadSupabaseBrowserClient()).resolves.toBe(client);
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://test-project.supabase.co',
      'test-publishable-key'
    );
    expect(client.auth.getSession).not.toHaveBeenCalled();
  });

  it('moves a localStorage session into the cookies once per page load', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, storedSession);
    const client = makeClient();
    const { loadSupabaseBrowserClient } = await importClientModule();

    await loadSupabaseBrowserClient();
    await loadSupabaseBrowserClient();

    expect(client.auth.setSession).toHaveBeenCalledOnce();
    expect(client.auth.setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(window.localStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
  });

  it('keeps a session that is already in the cookies', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, storedSession);
    const client = makeClient({ session: { user: { id: 'user-2' } } });
    const { loadSupabaseBrowserClient } = await importClientModule();

    await loadSupabaseBrowserClient();

    expect(client.auth.setSession).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
  });

  it('keeps the stored session for the next page load after a network failure', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, storedSession);
    makeClient({
      setSessionError: new AuthRetryableFetchError('Failed to fetch', 0),
    });
    const { loadSupabaseBrowserClient } = await importClientModule();

    await loadSupabaseBrowserClient();

    expect(window.localStorage.getItem(LEGACY_SESSION_KEY)).toBe(storedSession);
    expect(rollbarError).not.toHaveBeenCalled();
  });

  it('drops a stored session that cannot be restored', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, 'not json');
    const client = makeClient({
      setSessionError: new AuthSessionMissingError(),
    });
    const { loadSupabaseBrowserClient } = await importClientModule();

    await loadSupabaseBrowserClient();

    expect(client.auth.setSession).toHaveBeenCalledWith({
      access_token: '',
      refresh_token: '',
    });
    expect(window.localStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
  });

  it('reports an unexpected failure and still returns the client', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, storedSession);
    const client = makeClient();
    const error = new Error('Storage is broken');
    client.auth.getSession.mockRejectedValue(error);
    const { loadSupabaseBrowserClient } = await importClientModule();

    await expect(loadSupabaseBrowserClient()).resolves.toBe(client);
    expect(rollbarError).toHaveBeenCalledWith(error);
  });
});

describe('hasBrowserSession', () => {
  it('is true when the cookies hold a session', async () => {
    makeClient({ session: { user: { id: 'user-1' } } });
    const { hasBrowserSession } = await importClientModule();

    await expect(hasBrowserSession()).resolves.toBe(true);
  });

  it('moves a localStorage session into the cookies before checking', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, storedSession);
    const client = makeClient();
    client.auth.getSession
      .mockResolvedValueOnce({ data: { session: null }, error: null })
      .mockResolvedValueOnce({
        data: { session: { user: { id: 'user-1' } } },
        error: null,
      });
    const { hasBrowserSession } = await importClientModule();

    await expect(hasBrowserSession()).resolves.toBe(true);
    expect(client.auth.setSession).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
  });

  it('still counts a localStorage session that could not be moved yet', async () => {
    window.localStorage.setItem(LEGACY_SESSION_KEY, storedSession);
    makeClient({
      setSessionError: new AuthRetryableFetchError('Failed to fetch', 0),
    });
    const { hasBrowserSession } = await importClientModule();

    await expect(hasBrowserSession()).resolves.toBe(true);
  });

  it('is false without a session', async () => {
    makeClient();
    const { hasBrowserSession } = await importClientModule();

    await expect(hasBrowserSession()).resolves.toBe(false);
  });

  it('reports an unexpected failure and treats the visitor as signed out', async () => {
    const client = makeClient();
    const error = new Error('Storage is broken');
    client.auth.getSession.mockRejectedValue(error);
    const { hasBrowserSession } = await importClientModule();

    await expect(hasBrowserSession()).resolves.toBe(false);
    expect(rollbarError).toHaveBeenCalledWith(error);
  });
});
