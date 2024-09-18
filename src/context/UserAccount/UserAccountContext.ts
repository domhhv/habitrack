import type { AuthUser } from '@supabase/supabase-js';
import React from 'react';

type UserAccountContextType = {
  supabaseUser: AuthUser | null;
  authenticating: boolean;
  register: (username: string, password: string, name: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: (shouldShowSnackbar?: boolean) => void;
};

export const UserAccountContext = React.createContext<UserAccountContextType>({
  supabaseUser: { id: '', email: '', phone: '' } as AuthUser | null,
  authenticating: false,
  register: (_username: string, _password: string) => Promise.resolve(),
  login: (_username: string, _password: string) => Promise.resolve(),
  logout: (_shouldShowSnackbar?: boolean) => {},
});

export const useUserAccount = () => {
  const context = React.useContext(UserAccountContext);

  if (context === undefined) {
    throw new Error('useUserAccount must be used within a UserAccountProvider');
  }

  return context;
};
