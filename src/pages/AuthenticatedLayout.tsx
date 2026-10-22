import React from 'react';
import { Outlet, redirect } from 'react-router';

import { userContext, getLoginPath } from '@utils';

import type { Route } from './+types/AuthenticatedLayout';

/**
 * Sends signed-out document requests and data requests to the login page before anything renders.
 * The app layout's server middleware has already verified the session.
 */
const requireSession: Route.MiddlewareFunction = ({ context, request }) => {
  if (!context.get(userContext)) {
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
