import { ToastProvider, HeroUIProvider } from '@heroui/react';
import {
  Provider as RollbarProvider,
  ErrorBoundary as RollbarErrorBoundary,
} from '@rollbar/react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { I18nProvider } from 'react-aria';
import { useNavigate } from 'react-router';
import type { Configuration as RollbarConfiguration } from 'rollbar';

import ErrorFallbackPage from './pages/ErrorFallbackPage';

const Providers = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const rollbarConfig: RollbarConfiguration = {
    accessToken: ROLLBAR_CLIENT_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: ROLLBAR_CLIENT_ENV,
    payload: {
      client: {
        javascript: {
          code_version: '1.0.0',
          source_map_enabled: true,
        },
      },
    },
  };

  return (
    <RollbarProvider config={rollbarConfig}>
      <RollbarErrorBoundary fallbackUI={ErrorFallbackPage}>
        <HeroUIProvider navigate={navigate}>
          <I18nProvider>{children}</I18nProvider>
          <ToastProvider
            placement="top-center"
            toastProps={{
              variant: 'solid',
            }}
          />
        </HeroUIProvider>
      </RollbarErrorBoundary>
    </RollbarProvider>
  );
};

export default Providers;
