import { useNavigation, isRouteErrorResponse } from 'react-router';
import { Meta, Links, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { InfinityLoader } from '@components';

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
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
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
  const isNavigating = Boolean(navigation.location);

  return (
    <>
      <Outlet />
      {isNavigating && (
        <div className="loader-container">
          <InfinityLoader color="var(--accent)" />
          <span>We're preparing the app...</span>
        </div>
      )}
    </>
  );
}
