import {
  HeroUIProvider as OriginalHeroUIProvider,
  ToastProvider,
} from '@heroui/react';
import React, { type ReactNode } from 'react';
import { I18nProvider } from 'react-aria';
import { BrowserRouter, useNavigate } from 'react-router';

type ProviderProps = {
  children: ReactNode;
};

const HeroUIProvider = React.memo(function WrappedProvider({
  children,
}: ProviderProps) {
  const navigate = useNavigate();

  return (
    <OriginalHeroUIProvider navigate={navigate}>
      {children}
    </OriginalHeroUIProvider>
  );
});

const Providers = React.memo(function WrappedProviders({
  children,
}: ProviderProps) {
  return (
    <I18nProvider locale="en-GB">
      <BrowserRouter>
        <HeroUIProvider>
          <ToastProvider
            toastProps={{
              variant: 'solid',
              hideIcon: true,
            }}
            placement="bottom-center"
          />
          {children}
        </HeroUIProvider>
      </BrowserRouter>
    </I18nProvider>
  );
});

export default Providers;
