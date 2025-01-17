import { supabaseClient } from '@helpers';
import { NextUIProvider } from '@nextui-org/react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import React, { type ReactNode } from 'react';
import { I18nProvider } from 'react-aria';
import { BrowserRouter, useNavigate } from 'react-router-dom';

type ProviderProps = {
  children: ReactNode;
};

const PotentialSupabaseProvider = React.memo(function WrappedProvider({
  children,
}: ProviderProps) {
  if (!Object.keys(supabaseClient).length) {
    return children;
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
});

const Providers = React.memo(function WrappedProviders({
  children,
}: ProviderProps) {
  const navigate = useNavigate();

  return (
    <BrowserRouter>
      <I18nProvider locale="en-GB">
        <NextUIProvider navigate={navigate}>
          <PotentialSupabaseProvider>{children}</PotentialSupabaseProvider>
        </NextUIProvider>
      </I18nProvider>
    </BrowserRouter>
  );
});

export default Providers;
