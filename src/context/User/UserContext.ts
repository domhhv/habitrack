import React from 'react';

export type User = {
  id: string;
  username: string;
};

export type UserContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: (shouldShowSnackbar?: boolean) => void;
  loggingIn: boolean;
  accessToken: string | null;
};

export const UserContext = React.createContext<UserContextType>({
  user: null,
  login: (_username: string, _password: string) => Promise.resolve(),
  logout: (_shouldShowSnackbar?: boolean) => {},
  loggingIn: false,
  accessToken: null,
});

export const useUser = () => {
  const context = React.useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
