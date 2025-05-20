import {
  ToastProvider,
  HeroUIProvider as OriginalHeroUIProvider,
} from '@heroui/react';
import React, { type ReactNode } from 'react';
import { I18nProvider } from 'react-aria';
import { useNavigate, BrowserRouter } from 'react-router';

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
  locale,
}: ProviderProps & { locale: string }) {
  return (
    <BrowserRouter>
      <HeroUIProvider>
        <I18nProvider locale={locale}>
          <ToastProvider
            placement="top-center"
            toastProps={{
              variant: 'solid',
            }}
          />
          {children}
        </I18nProvider>
      </HeroUIProvider>
    </BrowserRouter>
  );
});

export default Providers;
