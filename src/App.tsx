import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { Outlet, type ShouldRevalidateFunctionArgs } from 'react-router';

import {
  AppHeader,
  AppSidebar,
  NoteDrawer,
  InfinityLoader,
  OccurrenceDrawer,
  ConfirmationDialog,
} from '@components';
import { useAuthSubscription } from '@hooks';
import { ErrorFallbackPage } from '@pages';
import { getProfile, getSession } from '@services';
import { useUserActions } from '@stores';
import {
  userContext,
  isAppDataStale,
  markAppDataStale,
  trackAppDataLoad,
} from '@utils';

import type { Route } from './+types/App';

const sessionMiddleware: Route.ClientMiddlewareFunction = async ({
  context,
}) => {
  context.set(userContext, await getSession());
};

export const clientMiddleware = [sessionMiddleware];

export const clientLoader = async ({
  context,
  request,
}: Route.ClientLoaderArgs) => {
  const finishAppDataLoad = trackAppDataLoad(request.signal);
  const user = context.get(userContext);
  const profile = user ? await getProfile(user.id) : null;

  finishAppDataLoad();

  return { profile, user };
};

export const shouldRevalidate = ({
  currentUrl,
  defaultShouldRevalidate,
  formMethod,
  nextUrl,
}: ShouldRevalidateFunctionArgs) => {
  if (!formMethod && currentUrl.href !== nextUrl.href) {
    return isAppDataStale();
  }

  if (defaultShouldRevalidate) {
    markAppDataStale();
  }

  return defaultShouldRevalidate;
};

export const HydrateFallback = () => {
  return (
    <main className="flex h-screen flex-1 items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-row items-center gap-4">
        <InfinityLoader color="var(--accent)" />
        <span>We're preparing the app...</span>
      </div>
    </main>
  );
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  return <ErrorFallbackPage error={error instanceof Error ? error : null} />;
};

const App = ({ loaderData: { user } }: Route.ComponentProps) => {
  const { setUser } = useUserActions();
  useAuthSubscription(user);

  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  /* Bridge: remove with the user slice, which still feeds the store subscription and data slices. */
  React.useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return (
    <>
      <Analytics />
      <AppHeader />
      <NoteDrawer />
      <OccurrenceDrawer />
      <ConfirmationDialog />
      <div className="flex w-full flex-1 items-stretch">
        <AppSidebar />
        <main className="flex min-h-[calc(100dvh-4rem)] min-w-0 flex-1 flex-col items-start bg-white max-md:pb-11.25 lg:min-h-dvh dark:bg-black">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default App;
