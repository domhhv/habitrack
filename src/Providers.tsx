import { Toast } from '@heroui/react';
import {
  Provider as RollbarProvider,
  ErrorBoundary as RollbarErrorBoundary,
} from '@rollbar/react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { I18nProvider } from 'react-aria';
import { RouterProvider } from 'react-aria-components';
import { useHref, useNavigate } from 'react-router';

import { ErrorFallbackPage } from '@pages';
import { rollbar } from '@utils';

const Providers = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  return (
    <RollbarProvider instance={rollbar}>
      <RollbarErrorBoundary fallbackUI={ErrorFallbackPage}>
        <RouterProvider useHref={useHref} navigate={navigate}>
          <I18nProvider>
            {children}
            <Toast.Provider placement="top" />
          </I18nProvider>
        </RouterProvider>
      </RollbarErrorBoundary>
    </RollbarProvider>
  );
};

export default Providers;
