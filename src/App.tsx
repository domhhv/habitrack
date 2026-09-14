import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import { data } from 'react-router';

import {
  AppHeader,
  AppSidebar,
  NoteDrawer,
  InfinityLoader,
  OccurrenceDrawer,
  ConfirmationDialog,
} from '@components';
import { useSession } from '@hooks';
import { ErrorFallbackPage } from '@pages';
import { useThemeActions } from '@stores';
import { preferences } from '@utils';

import type { Route } from './+types/App';
import AppRoutes from './AppRoutes';

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await preferences.parse(cookieHeader)) || {};

  return data({
    isSystemDark: cookie.isSystemDark,
    themeMode: cookie.themeMode,
  });
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await preferences.parse(cookieHeader)) || {};
  const formData = await request.formData();

  const themeMode = formData.get('themeMode');
  const isSystemDark = formData.get('isSystemDark');
  cookie.themeMode = themeMode;
  cookie.isSystemDark = isSystemDark;

  return data(
    { isSystemDark, themeMode },
    {
      headers: {
        'Set-Cookie': await preferences.serialize(cookie),
      },
    }
  );
}

const App = ({ loaderData }: Route.ComponentProps) => {
  const { error, isLoading } = useSession();
  const { applyMediaQueryChange } = useThemeActions();

  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  }, []);

  const resolvedThemeMode = React.useMemo(() => {
    if (loaderData.themeMode === 'system') {
      return loaderData.isSystemDark === 'true' ? 'dark' : 'light';
    }

    return loaderData.themeMode;
  }, [loaderData.themeMode, loaderData.isSystemDark]);

  React.useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      resolvedThemeMode === 'dark'
    );
  }, [resolvedThemeMode]);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaQueryListChange = (
      e: MediaQueryListEvent | MediaQueryList = mediaQueryList
    ) => {
      if (!loaderData.themeMode || loaderData.themeMode === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        cookieStore.set('isSystemDark', e.matches.toString());
        cookieStore.set('themeMode', 'system');
        applyMediaQueryChange(e.matches);
      }
    };

    mediaQueryList.addEventListener('change', handleMediaQueryListChange);

    handleMediaQueryListChange();

    return () => {
      mediaQueryList.removeEventListener('change', handleMediaQueryListChange);
    };
  }, [loaderData.themeMode, applyMediaQueryChange]);

  if (isLoading) {
    return (
      <main className="flex h-screen flex-1 items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-row items-center gap-4">
          <InfinityLoader color="var(--accent)" />
          <span>We're preparing the app...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <ErrorFallbackPage
        error={error}
        title="We couldn't load your session. Please try reloading the page."
      />
    );
  }

  return (
    <>
      <Analytics />
      <AppHeader />
      <NoteDrawer />
      <OccurrenceDrawer />
      <ConfirmationDialog />
      <div className="flex w-full flex-1 items-stretch">
        <AppSidebar />
        <main className="flex h-fit min-w-0 flex-1 flex-col items-start bg-white max-md:pb-11.25 dark:bg-black">
          <AppRoutes />
        </main>
      </div>
    </>
  );
};

export default App;
