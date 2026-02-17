import { ToastProvider, HeroUIProvider } from '@heroui/react';
import {
  Provider as RollbarProvider,
  ErrorBoundary as RollbarErrorBoundary,
} from '@rollbar/react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { I18nProvider } from 'react-aria';
import { useNavigate } from 'react-router';

import { ROLLBAR_CONFIG } from '@const';
import { ErrorFallbackPage } from '@pages';

const Providers = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  return (
    <RollbarProvider config={ROLLBAR_CONFIG}>
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
