import { RouterContextProvider } from 'react-router';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { supabaseContext } from './route-context';
import { supabaseMiddleware } from './supabase-middleware';

const { createServerClient } = vi.hoisted(() => {
  return { createServerClient: vi.fn() };
});

vi.mock('@supabase/ssr', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    createServerClient,
  };
});

type CookieMethods = {
  getAll: () => { name: string; value: string }[];
  setAll: (
    cookies: {
      name: string;
      options: Record<string, unknown>;
      value: string;
    }[],
    headers: Record<string, string>
  ) => void;
};

const serverClient = { isServerClient: true };

const getCookieMethods = () => {
  const [, , options] = createServerClient.mock.calls[0];

  return (options as { cookies: CookieMethods }).cookies;
};

const runMiddleware = (
  request: Request,
  next: (context: RouterContextProvider) => Response
) => {
  const context = new RouterContextProvider();

  return supabaseMiddleware(
    { context, params: {}, request } as unknown as Parameters<
      typeof supabaseMiddleware
    >[0],
    async () => {
      return next(context);
    }
  ) as Promise<Response>;
};

describe('supabaseMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerClient.mockReturnValue(serverClient);
  });

  it('gives the request a server client that reads the request cookies', async () => {
    const request = new Request('https://habitrack.test/calendar', {
      headers: { Cookie: 'theme=dark; sb-test-project-auth-token=base64-abc' },
    });

    await runMiddleware(request, (context) => {
      expect(context.get(supabaseContext)).toBe(serverClient);

      return new Response('ok');
    });

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test-project.supabase.co',
      'test-publishable-key',
      expect.any(Object)
    );
    expect(getCookieMethods().getAll()).toEqual([
      { name: 'theme', value: 'dark' },
      { name: 'sb-test-project-auth-token', value: 'base64-abc' },
    ]);
  });

  it('sends the cookies and cache headers written during the request', async () => {
    const response = await runMiddleware(
      new Request('https://habitrack.test/calendar'),
      () => {
        getCookieMethods().setAll(
          [
            {
              name: 'sb-test-project-auth-token',
              options: { maxAge: 100, path: '/' },
              value: 'base64-refreshed',
            },
            {
              name: 'sb-test-project-auth-token.1',
              options: { maxAge: 0, path: '/' },
              value: '',
            },
          ],
          { 'Cache-Control': 'private, no-store', Expires: '0' }
        );

        return new Response('ok');
      }
    );

    expect(response.headers.getSetCookie()).toEqual([
      'sb-test-project-auth-token=base64-refreshed; Max-Age=100; Path=/',
      'sb-test-project-auth-token.1=; Max-Age=0; Path=/',
    ]);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Expires')).toBe('0');
  });

  it('leaves the response alone when the session is untouched', async () => {
    const response = await runMiddleware(
      new Request('https://habitrack.test/calendar'),
      () => {
        return new Response('ok', {
          headers: { 'Cache-Control': 'public, max-age=60' },
        });
      }
    );

    expect(response.headers.getSetCookie()).toEqual([]);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
  });
});
