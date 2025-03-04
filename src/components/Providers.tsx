import {
  HeroUIProvider as OriginalHeroUIProvider,
  ToastProvider,
} from '@heroui/react';
import React, { type ReactNode } from 'react';
import { BrowserRouter, useNavigate } from 'react-router';

type ProviderProps = {
  children: ReactNode;
};

const HeroUIProvider = React.memo(function WrappedProvider({
  children,
}: ProviderProps) {
  const navigate = useNavigate();

  return (
    <OriginalHeroUIProvider navigate={navigate} locale="en-GB">
      {children}
    </OriginalHeroUIProvider>
  );
});

const Providers = React.memo(function WrappedProviders({
  children,
}: ProviderProps) {
  return (
    <BrowserRouter>
      <HeroUIProvider>
        <ToastProvider
          toastProps={{
            variant: 'solid',
          }}
          placement="top-center"
        />
        {children}
      </HeroUIProvider>
    </BrowserRouter>
  );
});

export default Providers;
