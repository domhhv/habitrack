import React from 'react';

export const UserAccountContext = React.createContext({
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
