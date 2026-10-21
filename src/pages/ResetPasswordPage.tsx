import { Link, Toast } from '@heroui/react';
import React from 'react';
import { data, replace, redirect } from 'react-router';

import { AuthForm } from '@components';
import { useIsSubmitting } from '@hooks';
import { sendPasswordResetEmail } from '@services';
import { userContext, getErrorMessage } from '@utils';

import type { Route } from './+types/ResetPasswordPage';

export const clientLoader = ({ context }: Route.ClientLoaderArgs) => {
  if (context.get(userContext)) {
    throw replace('/');
  }

  return null;
};

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const formData = await request.formData();

  try {
    await sendPasswordResetEmail(String(formData.get('email') ?? ''));
  } catch (error) {
    Toast.toast.danger(
      'Something went wrong while sending the reset password email. Please try again.',
      {
        description: `Error details: ${getErrorMessage(error)}`,
      }
    );

    return data({ error: getErrorMessage(error) }, { status: 400 });
  }

  Toast.toast.success(
    'Done! If there is an account associated with that email, you will receive a password reset link shortly.'
  );

  return redirect('/login');
};

const ResetPasswordPage = () => {
  const isAuthenticating = useIsSubmitting();

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
