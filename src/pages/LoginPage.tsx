import { Link, Toast } from '@heroui/react';
import React from 'react';
import { data, replace, redirect } from 'react-router';

import { AuthForm } from '@components';
import { useIsSubmitting } from '@hooks';
import { signIn } from '@services';
import { userContext, getErrorMessage } from '@utils';

import type { Route } from './+types/LoginPage';

export const clientLoader = ({ context }: Route.ClientLoaderArgs) => {
  if (context.get(userContext)) {
    throw replace('/calendar');
  }

  return null;
};

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const formData = await request.formData();

  try {
    await signIn(
      String(formData.get('email') ?? ''),
      String(formData.get('password') ?? '')
    );
  } catch (error) {
    Toast.toast.danger(
      'Something went wrong while logging in. Please try again.',
      {
        description: `Error details: ${getErrorMessage(error)}`,
      }
    );

    return data({ error: getErrorMessage(error) }, { status: 400 });
  }

  Toast.toast.success('Welcome back!');

  return redirect('/calendar');
};

const LoginPage = () => {
  const isAuthenticating = useIsSubmitting();

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
                <Link href="/register" className="text-accent font-medium">
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
              href="/anonymous-login"
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
