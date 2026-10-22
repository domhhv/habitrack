import { Analytics } from '@vercel/analytics/react';
import keyBy from 'lodash.keyby';
import React from 'react';
import {
  Outlet,
  type RouterContextProvider,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';

import {
  AppHeader,
  AppSidebar,
  NoteDrawer,
  AppShellSkeleton,
  OccurrenceDrawer,
  ConfirmationDialog,
} from '@components';
import { useAuthSubscription } from '@hooks';
import type { Profile } from '@models';
import { ErrorFallbackPage } from '@pages';
import {
  listHabits,
  getProfile,
  getSession,
  listTraits,
  getSessionUser,
  rememberCalendarFirstDayOfWeek,
} from '@services';
import {
  noop,
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

const sessionMiddleware: Route.MiddlewareFunction = async ({ context }) => {
  const supabase = context.get(supabaseContext);
  const user = await getSessionUser(supabase);
  let profileRequest: Promise<Profile | null> | null = null;

  context.set(userContext, user);
  context.set(profileContext, () => {
    profileRequest ??= user
      ? getProfile(supabase, user.id)
      : Promise.resolve(null);

    return profileRequest;
  });
};

export const middleware: Route.MiddlewareFunction[] = [
  supabaseMiddleware,
  sessionMiddleware,
];

const loadAppData = async (context: Readonly<RouterContextProvider>) => {
  const supabase = context.get(supabaseContext);
  const user = context.get(userContext);
  const [profile, habits, traits] = user
    ? await Promise.all([
        context.get(profileContext)(),
        listHabits(supabase),
        listTraits(supabase),
      ])
    : [null, [], []];

  return {
    habits: keyBy(habits, 'id'),
    profile,
    traits: keyBy(traits, 'id'),
    user,
  };
};

/**
 * Returns the app data as a promise, so a document request sends the app shell right away and
 * streams the data after it.
 */
export const loader = ({ context }: Route.LoaderArgs) => {
  const appData = loadAppData(context);
  appData.catch(noop);

  return { appData };
};

export const clientLoader = async ({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const finishAppDataLoad = trackAppDataLoad(request.signal);
  const { appData } = await serverLoader();
  const data = await appData;

  rememberCalendarFirstDayOfWeek(
    data.user?.id ?? null,
    data.profile?.firstDayOfWeek
  );
  finishAppDataLoad();

  return data;
};

clientLoader.hydrate = true as const;

const supabaseClientMiddleware: Route.ClientMiddlewareFunction = async ({
  context,
}) => {
  context.set(supabaseContext, await loadSupabaseBrowserClient());
};

const clientSessionMiddleware: Route.ClientMiddlewareFunction = async ({
  context,
}) => {
  context.set(userContext, await getSession(context.get(supabaseContext)));
};

export const clientMiddleware = [
  supabaseClientMiddleware,
  clientSessionMiddleware,
];

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
  return <AppShellSkeleton />;
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
