import { Analytics } from '@vercel/analytics/react';
import keyBy from 'lodash.keyby';
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
import type { Profile, TypedSupabaseClient } from '@models';
import { ErrorFallbackPage } from '@pages';
import { listHabits, getProfile, getSession, listTraits } from '@services';
import {
  userContext,
  profileContext,
  isAppDataStale,
  supabaseContext,
  markAppDataStale,
  trackAppDataLoad,
  supabaseMiddleware,
  loadSupabaseBrowserClient,
} from '@utils';

import type { Route } from './+types/App';

let profileRequest: { promise: Promise<Profile>; userId: string } | null = null;

const loadProfile = (supabase: TypedSupabaseClient, userId: string) => {
  if (profileRequest?.userId !== userId || isAppDataStale()) {
    const promise = getProfile(supabase, userId);

    profileRequest = { promise, userId };
    promise.catch(() => {
      if (profileRequest?.promise === promise) {
        profileRequest = null;
      }
    });
  }

  return profileRequest.promise;
};

export const middleware: Route.MiddlewareFunction[] = [supabaseMiddleware];

const supabaseClientMiddleware: Route.ClientMiddlewareFunction = async ({
  context,
}) => {
  context.set(supabaseContext, await loadSupabaseBrowserClient());
};

const sessionMiddleware: Route.ClientMiddlewareFunction = async ({
  context,
}) => {
  const supabase = context.get(supabaseContext);
  const user = await getSession(supabase);

  context.set(userContext, user);
  context.set(
    profileContext,
    user ? await loadProfile(supabase, user.id) : null
  );
};

export const clientMiddleware = [supabaseClientMiddleware, sessionMiddleware];

export const clientLoader = async ({
  context,
  request,
}: Route.ClientLoaderArgs) => {
  const finishAppDataLoad = trackAppDataLoad(request.signal);
  const supabase = context.get(supabaseContext);
  const user = context.get(userContext);
  const [habits, traits] = user
    ? await Promise.all([listHabits(supabase), listTraits(supabase)])
    : [[], []];

  finishAppDataLoad();

  return {
    habits: keyBy(habits, 'id'),
    profile: context.get(profileContext),
    traits: keyBy(traits, 'id'),
    user,
  };
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
  useAuthSubscription(user);

  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

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
