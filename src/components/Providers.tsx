import { supabaseClient } from '@helpers';
import { HeroUIProvider } from '@heroui/react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import React, { type ReactNode } from 'react';
import { I18nProvider } from 'react-aria';
import { BrowserRouter, useNavigate } from 'react-router-dom';

type ProviderProps = {
  children: ReactNode;
};

const LowerProviders = React.memo(function WrappedProvider({
  children,
}: ProviderProps) {
  const navigate = useNavigate();

  return <HeroUIProvider navigate={navigate}>{children}</HeroUIProvider>;
});

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

const UpperProviders = React.memo(function WrappedProvider({
  children,
}: ProviderProps) {
  return (
    <BrowserRouter>
      <I18nProvider locale="en-GB">{children}</I18nProvider>
    </BrowserRouter>
  );
});

const Providers = React.memo(function WrappedProviders({
  children,
}: ProviderProps) {
  return (
    <UpperProviders>
      <PotentialSupabaseProvider>
        <LowerProviders>{children}</LowerProviders>
      </PotentialSupabaseProvider>
    </UpperProviders>
  );
});

export default Providers;
