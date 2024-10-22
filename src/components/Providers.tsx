import {
  HabitsProvider,
  OccurrencesProvider,
  SnackbarProvider,
  TraitsProvider,
} from '@context';
import { supabaseClient } from '@helpers';
import { NextUIProvider } from '@nextui-org/react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import React, { type ReactNode } from 'react';
import { I18nProvider } from 'react-aria';
import { BrowserRouter, useNavigate } from 'react-router-dom';

type BaseProviderProps = {
  children: ReactNode;
};

type ProviderProps = BaseProviderProps & {
  rangeStart: number;
  rangeEnd: number;
};

const LowerProviders = ({ children, rangeStart, rangeEnd }: ProviderProps) => {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <SnackbarProvider>
        <TraitsProvider>
          <HabitsProvider>
            <OccurrencesProvider rangeStart={rangeStart} rangeEnd={rangeEnd}>
              {children}
            </OccurrencesProvider>
          </HabitsProvider>
        </TraitsProvider>
      </SnackbarProvider>
    </NextUIProvider>
  );
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

const UpperProviders = ({ children }: BaseProviderProps) => {
  return (
    <BrowserRouter>
      <I18nProvider locale="en-GB">{children}</I18nProvider>
    </BrowserRouter>
  );
};

const Providers = ({ children, rangeStart, rangeEnd }: ProviderProps) => {
  return (
    <UpperProviders>
      <PotentialSupabaseProvider>
        <LowerProviders rangeStart={rangeStart} rangeEnd={rangeEnd}>
          {children}
        </LowerProviders>
      </PotentialSupabaseProvider>
    </UpperProviders>
  );
};

export default Providers;
