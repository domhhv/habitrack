import { userActions } from '@actions';
import React from 'react';

import { SnackbarContext } from './Snackbar';

export type User = {
  id: string;
  username: string;
};

type UserContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loggingIn: boolean;
  accessToken: string | null;
};

export const UserContext = React.createContext<UserContextType>({
  user: null,
  login: (_username: string, _password: string) => Promise.resolve(),
  logout: () => {},
  loggingIn: false,
  accessToken: null,
});

type Props = {
  children: React.ReactNode;
};

export default function UserProvider({ children }: Props) {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [loggingIn, setLoggingIn] = React.useState(false);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const accessToken = JSON.parse(
      localStorage.getItem('user_access_token') || 'null'
    );

    if (user && accessToken) {
      setUser(user);
      setAccessToken(accessToken);
    } else {
      showSnackbar('Please login to use the calendar', {
        variant: 'solid',
        color: 'neutral',
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoggingIn(true);
    try {
      const loginResponse = await userActions.login(username, password);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
      localStorage.setItem(
        'user_access_token',
        JSON.stringify(loginResponse.access_token)
      );
      setAccessToken(loginResponse.access_token);
      setUser(user);
      const snackbarMessage = loginResponse.signedUp
        ? `Welcome, ${loginResponse.user.username}!`
        : `Welcome back, ${loginResponse.user.username}!`;
      showSnackbar(snackbarMessage, {
        variant: 'solid',
        color: 'success',
      });
    } catch (e) {
      if ((e as Error).message === 'Wrong password') {
        showSnackbar('Wrong password', {
          variant: 'solid',
          color: 'danger',
        });

        throw e;
      }

      showSnackbar('Something went wrong', {
        variant: 'solid',
        color: 'danger',
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    showSnackbar('You have logged out', {
      variant: 'outlined',
      color: 'neutral',
    });
  };

  const value = React.useMemo(
    () => ({ user, loggingIn, accessToken, login, logout }),
    [user, loggingIn, accessToken]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
