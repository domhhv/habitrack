import { RouterContextProvider } from 'react-router';
import { it, expect, describe } from 'vitest';

import type { ActionToast } from '@models';

import {
  flashContext,
  flashMiddleware,
  redirectWithToasts,
} from './flash-toasts';

const welcome: ActionToast = { title: 'Welcome back!', variant: 'success' };

const getFlashCookieHeader = async (toasts: unknown[]) => {
  const response = await redirectWithToasts('/calendar/month', [
    ...(toasts as ActionToast[]),
  ]);

  return response.headers.get('Set-Cookie')?.split(';')[0] ?? '';
};

const runMiddleware = async (
  cookie: string | null,
  next: (context: RouterContextProvider) => void = () => {}
) => {
  const context = new RouterContextProvider();
  const request = new Request('http://localhost/calendar/month', {
    headers: cookie ? { Cookie: cookie } : {},
  });

  return (await flashMiddleware(
    { context, params: {}, request } as unknown as Parameters<
      typeof flashMiddleware
    >[0],
    async () => {
      next(context);

      return new Response(null);
    }
  )) as Response;
};

describe('redirectWithToasts', () => {
  it('redirects and stores the toasts in a short-lived cookie', async () => {
    const response = await redirectWithToasts('/login', [welcome]);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/login');
    expect(response.headers.get('Set-Cookie')).toMatch(
      /^flash=.+; Max-Age=60; Path=\/; HttpOnly; SameSite=Lax$/
    );
  });
});

describe('flashMiddleware', () => {
  it('hands the toasts to the loader that takes them and clears the cookie', async () => {
    let toasts: ActionToast[] = [];
    const response = await runMiddleware(
      await getFlashCookieHeader([welcome]),
      (context) => {
        toasts = context.get(flashContext).take();
      }
    );

    expect(toasts).toEqual([welcome]);
    expect(response.headers.get('Set-Cookie')).toMatch(/^flash=; Max-Age=0/);
  });

  it('keeps the cookie for a later request when nothing takes the toasts', async () => {
    const response = await runMiddleware(await getFlashCookieHeader([welcome]));

    expect(response.headers.get('Set-Cookie')).toBeNull();
  });

  it('drops values that are not toasts', async () => {
    let toasts: ActionToast[] = [];

    await runMiddleware(
      await getFlashCookieHeader([welcome, { title: 1 }, 'text']),
      (context) => {
        toasts = context.get(flashContext).take();
      }
    );

    expect(toasts).toEqual([welcome]);
  });

  it('leaves the response alone without a flash cookie', async () => {
    let toasts: ActionToast[] | null = null;
    const response = await runMiddleware(null, (context) => {
      toasts = context.get(flashContext).take();
    });

    expect(toasts).toEqual([]);
    expect(response.headers.get('Set-Cookie')).toBeNull();
  });
});
