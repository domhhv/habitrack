import { Link, Toast } from '@heroui/react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router';

import { AuthForm } from '@components';
import { signIn } from '@services';
import { useUser } from '@stores';
import { getErrorMessage } from '@utils';

const LoginPage = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);

      await signIn(email, password);

      Toast.toast.success('Welcome back!');

      navigate('/');
    } catch (error) {
      Toast.toast.danger(
        'Something went wrong while logging in. Please try again.',
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
            onSubmit={handleSubmit}
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
      </div>
    </div>
  );
};

export default LoginPage;
