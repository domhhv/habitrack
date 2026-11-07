import {
  redirect,
  createCookie,
  createContext,
  type MiddlewareFunction,
} from 'react-router';

import type { ActionToast } from '@models';

const flashCookie = createCookie('flash', {
  httpOnly: true,
  maxAge: 60,
  path: '/',
  sameSite: 'lax',
  secure: import.meta.env.PROD,
});

const isActionToast = (value: unknown): value is ActionToast => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { description, title, variant } = value as Record<string, unknown>;

  return (
    typeof title === 'string' &&
    (variant === 'success' || variant === 'danger') &&
    (description === undefined || typeof description === 'string')
  );
};

/**
 * Toasts that an action left for the next request, which only a loader that shows them takes.
 * Taking them clears the cookie in the response.
 */
export const flashContext = createContext<{ take: () => ActionToast[] }>({
  take: () => {
    return [];
  },
});

/**
 * Redirects with toasts for the page the redirect lands on, because a redirect leaves no action
 * data for the submitting page to show them from.
 */
export const redirectWithToasts = async (
  url: string,
  toasts: ActionToast[]
) => {
  return redirect(url, {
    headers: { 'Set-Cookie': await flashCookie.serialize(toasts) },
  });
};

export const flashMiddleware: MiddlewareFunction<Response> = async (
  { context, request },
  next
) => {
  const value: unknown = await flashCookie.parse(request.headers.get('Cookie'));
  const toasts = Array.isArray(value) ? value.filter(isActionToast) : [];
  let isTaken = false;

  context.set(flashContext, {
    take: () => {
      isTaken = true;

      return toasts;
    },
  });

  const response = await next();

  if (isTaken && value !== null) {
    response.headers.append(
      'Set-Cookie',
      await flashCookie.serialize('', { maxAge: 0 })
    );
  }

  return response;
};
