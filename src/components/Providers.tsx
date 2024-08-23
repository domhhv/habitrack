import {
  HabitsProvider,
  OccurrencesProvider,
  SnackbarProvider,
  TraitsProvider,
  UserAccountProvider,
} from '@context';
import { supabaseClient, theme } from '@helpers';
import { CssVarsProvider } from '@mui/joy';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import React from 'react';

type ProviderProps = {
  children: React.ReactNode;
  rangeStart: number;
  rangeEnd: number;
};

const Providers = ({ children, rangeStart, rangeEnd }: ProviderProps) => {
  return (
    <CssVarsProvider defaultMode="system" theme={theme}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <SnackbarProvider>
          <UserAccountProvider>
            <TraitsProvider>
              <HabitsProvider>
                <OccurrencesProvider
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                >
                  {children}
                </OccurrencesProvider>
              </HabitsProvider>
            </TraitsProvider>
          </UserAccountProvider>
        </SnackbarProvider>
      </SessionContextProvider>
    </CssVarsProvider>
  );
};

export default Providers;
