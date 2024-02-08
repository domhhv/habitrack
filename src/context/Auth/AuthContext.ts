import React from 'react';

export type Account = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  name: string;
};

type AuthContextType = {
  authenticating: boolean;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: (shouldShowSnackbar?: boolean) => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  authenticating: false,
  register: (_username: string, _password: string) => Promise.resolve(),
  login: (_username: string, _password: string) => Promise.resolve(),
  logout: (_shouldShowSnackbar?: boolean) => {},
});

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
};
