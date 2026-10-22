import {
  parseCookieHeader,
  type CookieOptions,
  createServerClient,
  serializeCookieHeader,
} from '@supabase/ssr';
import type { MiddlewareFunction } from 'react-router';

import type { Database } from '@db-types';

import { supabaseContext } from './route-context';

type CookieToSet = {
  name: string;
  options: CookieOptions;
  value: string;
};

/**
 * Gives every server request its own Supabase client that reads the session from the request
 * cookies. Nothing reads the session up front, so a token refresh only happens once server code
 * asks for the user, and the cookies it writes are sent back with the response.
 */
export const supabaseMiddleware: MiddlewareFunction<Response> = async (
  { context, request },
  next
) => {
  const cookiesToSet: CookieToSet[] = [];
  const headersToSet = new Map<string, string>();

  context.set(
    supabaseContext,
    createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => {
          return parseCookieHeader(request.headers.get('Cookie') ?? '');
        },
        setAll: (cookies, headers) => {
          cookiesToSet.push(...cookies);
          Object.entries(headers).forEach(([name, value]) => {
            headersToSet.set(name, value);
          });
        },
      },
    })
  );

  const response = await next();

  cookiesToSet.forEach(({ name, options, value }) => {
    response.headers.append(
      'Set-Cookie',
      serializeCookieHeader(name, value, options)
    );
  });
  headersToSet.forEach((value, name) => {
    response.headers.set(name, value);
  });

  return response;
};
