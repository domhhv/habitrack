import type { AuthUser } from '@supabase/supabase-js';
import React from 'react';

type UserAccountContextType = {
  supabaseUser: AuthUser | null;
  authenticating: boolean;
  register: (username: string, password: string, name: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: (shouldShowSnackbar?: boolean) => void;
};

export const UserAccountContext =
  React.createContext<UserAccountContextType | null>(null);

export const useUserAccount = () => {
  const context = React.useContext(UserAccountContext);

  if (!context) {
    throw new Error('useUserAccount must be used within a UserAccountProvider');
  }

  return context;
};
