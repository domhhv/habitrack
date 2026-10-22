import { useMatches, useNavigation, isRouteErrorResponse } from 'react-router';
import { Meta, Links, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { AppShellSkeleton } from '@components';
import { initializeTheme, rememberTimeZone } from '@utils';

import type { Route } from './+types/root';
import './index.css';
import Providers from './Providers';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }

  return <h1>Unknown Error</h1>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(${initializeTheme.toString()})()`,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(${rememberTimeZone.toString()})()`,
          }}
        />
        <title>Habitrack</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Providers>
          {children}
          <ScrollRestoration />
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}

export default function Root() {
  const navigation = useNavigation();
  const matches = useMatches();
  const isEnteringApp =
    Boolean(navigation.location) &&
    !matches.some((match) => {
      return match.id === 'app';
    });

  return (
    <>
      <Outlet />
      {isEnteringApp && (
        <div className="fixed inset-0 z-50">
          <AppShellSkeleton />
        </div>
      )}
    </>
  );
}
