import { Link } from '@heroui/react';
import React from 'react';
import { href, replace } from 'react-router';

import { AuthForm } from '@components';
import { useAuthHref, useIsSubmitting, useActionToasts } from '@hooks';
import { signIn } from '@services';
import {
  failAction,
  userContext,
  getReturnToPath,
  supabaseContext,
  redirectWithToasts,
} from '@utils';

import type { Route } from './+types/LoginPage';

export const clientLoader = ({ context, request }: Route.ClientLoaderArgs) => {
  if (context.get(userContext)) {
    throw replace(getReturnToPath(request.url));
  }

  return null;
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  const formData = await request.formData();

  try {
    await signIn(
      context.get(supabaseContext),
      String(formData.get('email') ?? ''),
      String(formData.get('password') ?? '')
    );
  } catch (error) {
    return failAction(
      'Something went wrong while logging in. Please try again.',
      error
    );
  }

  return redirectWithToasts(getReturnToPath(request.url), [
    { title: 'Welcome back!', variant: 'success' },
  ]);
};

const LoginPage = ({ actionData }: Route.ComponentProps) => {
  const isAuthenticating = useIsSubmitting();
  useActionToasts(actionData);
  const registerHref = useAuthHref(href('/register'));
  const anonymousLoginHref = useAuthHref(href('/anonymous-login'));

  return (
    <div className="flex w-full flex-col items-center px-8 py-2 lg:px-16 lg:py-4">
      <title>Log In | Habitrack</title>
      <div className="mt-8 flex w-full flex-col items-center md:w-96">
        <h1 className="text-xl font-semibold">Log in to Habitrack</h1>
        <p className="text-muted mt-1 text-sm">
          Welcome back. Enter your email and password.
        </p>
        <div className="mt-6 w-full">
          <AuthForm
            canReset
            submitLabel="Log in"
            isAuthenticating={isAuthenticating}
            footer={
              <>
                Don&apos;t have an account?{' '}
                <Link href={registerHref} className="text-accent font-medium">
                  Join
                </Link>
              </>
            }
          />
        </div>
        <div className="border-secondary mt-6 w-full border-t pt-6 text-center">
          <p className="text-muted text-sm">
            Just want to look around?{' '}
            <Link
              href={anonymousLoginHref}
              data-testid="anonymous-login-link"
              className="text-accent font-medium"
            >
              Try Habitrack instantly
            </Link>{' '}
            — no email or sign-up needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
