import { Link } from '@heroui/react';
import React from 'react';
import { Form, href, replace } from 'react-router';

import { CustomButton } from '@components';
import {
  useAuthHref,
  useIsSubmitting,
  useActionToasts,
  useFirstDayOfWeek,
} from '@hooks';
import { signInAnonymously } from '@services';
import {
  failAction,
  userContext,
  parseDayOfWeek,
  getReturnToPath,
  supabaseContext,
  redirectWithToasts,
} from '@utils';

import type { Route } from './+types/AnonymousLoginPage';

export const clientLoader = ({ context, request }: Route.ClientLoaderArgs) => {
  if (context.get(userContext)) {
    throw replace(getReturnToPath(request.url));
  }

  return null;
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  const formData = await request.formData();

  try {
    await signInAnonymously(
      context.get(supabaseContext),
      parseDayOfWeek(formData.get('firstDayOfWeek'))
    );
  } catch (error) {
    return failAction(
      'Something went wrong while logging in anonymously. Please try again.',
      error
    );
  }

  return redirectWithToasts(getReturnToPath(request.url), [
    {
      title: 'Welcome to Habitrack! You are browsing anonymously',
      variant: 'success',
    },
  ]);
};

const AnonymousLoginPage = ({ actionData }: Route.ComponentProps) => {
  const firstDayOfWeek = useFirstDayOfWeek();
  const isAuthenticating = useIsSubmitting();
  useActionToasts(actionData);
  const registerHref = useAuthHref(href('/register'));
  const loginHref = useAuthHref(href('/login'));

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
          <Form method="post">
            <input type="hidden" name="firstDayOfWeek" value={firstDayOfWeek} />
            <CustomButton
              fullWidth
              type="submit"
              variant="primary"
              isPending={isAuthenticating}
              data-testid="anonymous-login-button"
            >
              Continue without an account
            </CustomButton>
          </Form>
          <div className="text-muted text-center text-sm">
            Prefer a permanent account?{' '}
            <Link href={registerHref} className="text-accent font-medium">
              Join
            </Link>{' '}
            or{' '}
            <Link href={loginHref} className="text-accent font-medium">
              log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousLoginPage;
