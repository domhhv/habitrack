import React from 'react';

export type User = {
  id: number;
  username: string;
  token: string;
};

export type LocalUser = User & {
  token: string;
};

export const DEFAULT_USER: LocalUser = {
  id: 0,
  username: '',
  token: '',
};

export type UserContextType = {
  user: LocalUser;
  authenticating: boolean;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: (shouldShowSnackbar?: boolean) => void;
};

export const UserContext = React.createContext<UserContextType>({
  user: DEFAULT_USER,
  authenticating: false,
  register: (_username: string, _password: string) => Promise.resolve(),
  login: (_username: string, _password: string) => Promise.resolve(),
  logout: (_shouldShowSnackbar?: boolean) => {},
});

export const useUser = () => {
  const context = React.useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
