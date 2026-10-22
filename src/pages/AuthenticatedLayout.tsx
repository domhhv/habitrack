import React from 'react';
import { Outlet, redirect } from 'react-router';

import { getSessionClaims } from '@services';
import { userContext, getLoginPath, supabaseContext } from '@utils';

import type { Route } from './+types/AuthenticatedLayout';

/**
 * Sends signed-out document requests to the login page before any HTML renders. When Supabase Auth
 * can't be reached, the request goes through and the client guard below decides.
 */
const requireSession: Route.MiddlewareFunction = async ({
  context,
  request,
}) => {
  let hasSession: boolean;

  try {
    hasSession = !!(await getSessionClaims(context.get(supabaseContext)));
  } catch {
    return;
  }

  if (!hasSession) {
    throw redirect(getLoginPath(request.url));
  }
};

const requireUser: Route.ClientMiddlewareFunction = ({ context, request }) => {
  if (!context.get(userContext)) {
    throw redirect(getLoginPath(request.url));
  }
};

export const middleware = [requireSession];

export const clientMiddleware = [requireUser];

const AuthenticatedLayout = () => {
  return <Outlet />;
};

export default AuthenticatedLayout;
