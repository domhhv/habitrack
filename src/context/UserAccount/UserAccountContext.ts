import type { AuthUser } from '@supabase/supabase-js';
import React from 'react';

type UserAccountContextType = {
  supabaseUser: AuthUser | null;
  authenticating: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: (shouldShowSnackbar?: boolean) => void;
  resetPassword: (email: string) => Promise<void>;
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
