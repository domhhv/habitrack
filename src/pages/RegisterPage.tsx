import { Link, Toast } from '@heroui/react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router';

import { AuthForm } from '@components';
import { useFirstDayOfWeek } from '@hooks';
import { signUp } from '@services';
import { useUser } from '@stores';
import { getErrorMessage } from '@utils';

const RegisterPage = () => {
  const user = useUser();
  const navigate = useNavigate();
  const firstDayOfWeek = useFirstDayOfWeek();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);

      await signUp(email, password, firstDayOfWeek);

      Toast.toast.success(
        'Account created! Please check your email to confirm your account before logging in.'
      );

      navigate('/login');
    } catch (error) {
      Toast.toast.danger(
        'Something went wrong while creating your account. Please try again.',
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
      <title>Join | Habitrack</title>
      <div className="mt-8 flex w-full flex-col items-center md:w-96">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-muted mt-1 text-sm">
          Register with an email and a password.
        </p>
        <div className="mt-6 w-full">
          <AuthForm
            onSubmit={handleSubmit}
            submitLabel="Create account"
            passwordAutoComplete="new-password"
            isAuthenticating={isAuthenticating}
            footer={
              <>
                Already have an account?{' '}
                <Link href="/login" className="text-accent font-medium">
                  Log in
                </Link>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
