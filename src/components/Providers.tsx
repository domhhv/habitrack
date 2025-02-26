import { HeroUIProvider as OriginalHeroUIProvider } from '@heroui/react';
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
    <BrowserRouter>
      <I18nProvider locale="en-GB">
        <HeroUIProvider>{children}</HeroUIProvider>
      </I18nProvider>
    </BrowserRouter>
  );
});

export default Providers;
