import { Link, Toast } from '@heroui/react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router';

import { AuthForm } from '@components';
import { sendPasswordResetEmail } from '@services';
import { useUser } from '@stores';
import { getErrorMessage } from '@utils';

const ResetPasswordPage = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (email: string) => {
    try {
      setIsAuthenticating(true);

      await sendPasswordResetEmail(email);

      Toast.toast.success(
        'Done! If there is an account associated with that email, you will receive a password reset link shortly.'
      );

      navigate('/login');
    } catch (error) {
      Toast.toast.danger(
        'Something went wrong while sending the reset password email. Please try again.',
        {
          description: `Error details: ${getErrorMessage(error)}`,
        }
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center px-8 py-2 lg:px-16 lg:py-4">
      <title>Reset Password | Habitrack</title>
      <div className="mt-8 flex w-full flex-col items-center md:w-96">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <div className="mt-6 w-full">
          <AuthForm
            withPassword={false}
            onSubmit={handleSubmit}
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
