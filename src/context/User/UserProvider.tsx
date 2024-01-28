import { type User, useSnackbar, UserContext } from '@context';
import { userService } from '@services';
import React from 'react';

type UserProviderProps = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: UserProviderProps) => {
  const { showSnackbar } = useSnackbar();
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
  }, [showSnackbar]);

  const login = async (username: string, password: string) => {
    setLoggingIn(true);
    try {
      const loginResponse = await userService.login(username, password);
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

      if ((e as Error).message === 'Token expired') {
        return showSnackbar('You have been logged out', {
          variant: 'solid',
          color: 'danger',
        });
      }

      showSnackbar('Something went wrong', {
        variant: 'solid',
        color: 'danger',
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = (shouldShowSnackbar: boolean = true) => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_access_token');
    setUser(null);
    setAccessToken(null);
    if (shouldShowSnackbar) {
      showSnackbar('You have logged out', {
        variant: 'outlined',
        color: 'neutral',
      });
    }
  };

  const value = React.useMemo(
    () => ({ user, loggingIn, accessToken, login, logout }),
    [user, loggingIn, accessToken]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
