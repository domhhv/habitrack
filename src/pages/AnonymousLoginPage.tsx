import { Link, Toast } from '@heroui/react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router';

import { CustomButton } from '@components';
import { useFirstDayOfWeek } from '@hooks';
import { signInAnonymously } from '@services';
import { useUser } from '@stores';
import { getErrorMessage } from '@utils';

const AnonymousLoginPage = () => {
  const user = useUser();
  const navigate = useNavigate();
  const firstDayOfWeek = useFirstDayOfWeek();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleContinue = async () => {
    try {
      setIsAuthenticating(true);

      await signInAnonymously(firstDayOfWeek);

      Toast.toast.success('Welcome to Habitrack! You are browsing anonymously');

      navigate('/');
    } catch (error) {
      Toast.toast.danger(
        'Something went wrong while logging in anonymously. Please try again.',
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
      <title>Try Anonymously | Habitrack</title>
      <div className="mt-8 flex w-full flex-col items-center md:w-96">
        <h1 className="text-xl font-semibold">Try Habitrack instantly</h1>
        <p className="text-muted mt-1 text-sm">
          No email, no password, no sign-up. One click and you are in.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3">
          <div className="border-secondary rounded-lg border p-4">
            <h2 className="text-sm font-medium">How anonymous login works</h2>
            <ul className="text-muted mt-2 list-disc space-y-1.5 pl-4 text-sm">
              <li>
                We create a temporary account for you, without asking for any
                personal details.
              </li>
              <li>
                Everything you do — habits, entries, notes — is saved to that
                account, so nothing is lost while you explore.
              </li>
              <li>
                Your session lives in this browser. If you log out or clear your
                browser data, you will not be able to get back into the
                temporary account.
              </li>
              <li>
                Ready to stay? Add your email and a password on the registration
                page at any time, and all of your data carries over to your
                permanent account.
              </li>
            </ul>
          </div>
          <CustomButton
            fullWidth
            variant="primary"
            onPress={handleContinue}
            isPending={isAuthenticating}
            data-testid="anonymous-login-button"
          >
            Continue without an account
          </CustomButton>
          <div className="text-muted text-center text-sm">
            Prefer a permanent account?{' '}
            <Link href="/register" className="text-accent font-medium">
              Join
            </Link>{' '}
            or{' '}
            <Link href="/login" className="text-accent font-medium">
              log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousLoginPage;
