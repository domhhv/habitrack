import { Link } from '@heroui/react';
import React from 'react';
import { replace } from 'react-router';

import { AuthForm } from '@components';
import { useIsSubmitting, useActionToasts } from '@hooks';
import { sendPasswordResetEmail } from '@services';
import {
  failAction,
  userContext,
  supabaseContext,
  redirectWithToasts,
} from '@utils';

import type { Route } from './+types/ResetPasswordPage';

export const clientLoader = ({ context }: Route.ClientLoaderArgs) => {
  if (context.get(userContext)) {
    throw replace('/calendar');
  }

  return null;
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  const formData = await request.formData();

  try {
    await sendPasswordResetEmail(
      context.get(supabaseContext),
      new URL(request.url).origin,
      String(formData.get('email') ?? '')
    );
  } catch (error) {
    return failAction(
      'Something went wrong while sending the reset password email. Please try again.',
      error
    );
  }

  return redirectWithToasts('/login', [
    {
      variant: 'success',
      title:
        'Done! If there is an account associated with that email, you will receive a password reset link shortly.',
    },
  ]);
};

const ResetPasswordPage = ({ actionData }: Route.ComponentProps) => {
  const isAuthenticating = useIsSubmitting();
  useActionToasts(actionData);

  return (
    <div className="flex w-full flex-col items-center px-8 py-2 lg:px-16 lg:py-4">
      <title>Reset Password | Habitrack</title>
      <div className="mt-8 flex w-full flex-col items-center md:w-96">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <div className="mt-6 w-full">
          <AuthForm
            withPassword={false}
            submitLabel="Send link"
            isAuthenticating={isAuthenticating}
            description="Enter your email address below and we will send you a link to reset your password."
            footer={
              <Link href="/login" className="text-accent font-medium">
                Back to login
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
