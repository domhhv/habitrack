import { supabaseClient } from '@helpers';
import { NextUIProvider } from '@nextui-org/react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import React, { type ReactNode } from 'react';
import { I18nProvider } from 'react-aria';
import { BrowserRouter, useNavigate } from 'react-router-dom';

type ProviderProps = {
  children: ReactNode;
};

const LowerProviders = ({ children }: ProviderProps) => {
  const navigate = useNavigate();

  return <NextUIProvider navigate={navigate}>{children}</NextUIProvider>;
};

const PotentialSupabaseProvider = ({ children }: { children: ReactNode }) => {
  if (!Object.keys(supabaseClient).length) {
    return children;
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
};

const UpperProviders = ({ children }: ProviderProps) => {
  return (
    <BrowserRouter>
      <I18nProvider locale="en-GB">{children}</I18nProvider>
    </BrowserRouter>
  );
};

const Providers = ({ children }: ProviderProps) => {
  return (
    <UpperProviders>
      <PotentialSupabaseProvider>
        <LowerProviders>{children}</LowerProviders>
      </PotentialSupabaseProvider>
    </UpperProviders>
  );
};

export default Providers;
