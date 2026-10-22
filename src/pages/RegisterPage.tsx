import { Link, Toast } from '@heroui/react';
import React from 'react';
import { data, replace, redirect } from 'react-router';

import { AuthForm } from '@components';
import { useIsSubmitting, useFirstDayOfWeek } from '@hooks';
import { signUp, convertAnonymousUser } from '@services';
import {
  userContext,
  parseDayOfWeek,
  getErrorMessage,
  supabaseContext,
} from '@utils';

import type { Route } from './+types/RegisterPage';

export const clientLoader = ({ context }: Route.ClientLoaderArgs) => {
  const user = context.get(userContext);

  if (user && !user.isAnonymous) {
    throw replace('/calendar');
  }

  return { isAnonymousUser: !!user?.isAnonymous };
};

export const clientAction = async ({
  context,
  request,
}: Route.ClientActionArgs) => {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const supabase = context.get(supabaseContext);
  const isAnonymousUser = !!context.get(userContext)?.isAnonymous;

  try {
    if (isAnonymousUser) {
      await convertAnonymousUser(supabase, email, password);
    } else {
      await signUp(
        supabase,
        email,
        password,
        parseDayOfWeek(formData.get('firstDayOfWeek'))
      );
    }
  } catch (error) {
    Toast.toast.danger(
      'Something went wrong while creating your account. Please try again.',
      {
        description: `Error details: ${getErrorMessage(error)}`,
      }
    );

    return data({ error: getErrorMessage(error) }, { status: 400 });
  }

  if (isAnonymousUser) {
    Toast.toast.success(
      'Almost there! Check your inbox to confirm your email. All your habits and notes stay with your account.'
    );

    return redirect('/calendar');
  }

  Toast.toast.success(
    'Account created! Please check your email to confirm your account before logging in.'
  );

  return redirect('/login');
};

const RegisterPage = ({
  loaderData: { isAnonymousUser },
}: Route.ComponentProps) => {
  const firstDayOfWeek = useFirstDayOfWeek();
  const isAuthenticating = useIsSubmitting();

  return (
    <div className="flex w-full flex-col items-center px-8 py-2 lg:px-16 lg:py-4">
      <title>Join | Habitrack</title>
      <div className="mt-8 flex w-full flex-col items-center md:w-96">
        <h1 className="text-xl font-semibold">
          {isAnonymousUser
            ? 'Make your account permanent'
            : 'Create your account'}
        </h1>
        <p className="text-muted mt-1 text-sm">
          {isAnonymousUser
            ? 'Add an email and a password to keep everything you have created and log in from any device.'
            : 'Register with an email and a password.'}
        </p>
        <div className="mt-6 w-full">
          <AuthForm
            passwordAutoComplete="new-password"
            isAuthenticating={isAuthenticating}
            submitLabel={isAnonymousUser ? 'Save my account' : 'Create account'}
            footer={
              isAnonymousUser ? (
                <>
                  Your habits, entries, and notes carry over automatically —
                  nothing is lost.
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link href="/login" className="text-accent font-medium">
                    Log in
                  </Link>
                </>
              )
            }
          >
            <input type="hidden" name="firstDayOfWeek" value={firstDayOfWeek} />
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
