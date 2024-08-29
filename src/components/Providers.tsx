import {
  HabitsProvider,
  OccurrencesProvider,
  SnackbarProvider,
  TraitsProvider,
  UserAccountProvider,
} from '@context';
import { supabaseClient, theme } from '@helpers';
import { CssVarsProvider } from '@mui/joy';
import { NextUIProvider } from '@nextui-org/react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type ProviderProps = {
  children: React.ReactNode;
  rangeStart: number;
  rangeEnd: number;
};

const Providers = ({ children, rangeStart, rangeEnd }: ProviderProps) => {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
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
    </NextUIProvider>
  );
};

export default Providers;
