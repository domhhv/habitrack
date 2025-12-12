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

const HeroUIProvider = React.memo(({ children }: ProviderProps) => {
  const navigate = useNavigate();

  return (
    <OriginalHeroUIProvider navigate={navigate}>
      {children}
    </OriginalHeroUIProvider>
  );
});
HeroUIProvider.displayName = 'HeroUIProvider';

const Providers = React.memo(({ children }: ProviderProps) => {
  return (
    <BrowserRouter>
      <HeroUIProvider>
        <I18nProvider>
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
Providers.displayName = 'Providers';

export default Providers;
