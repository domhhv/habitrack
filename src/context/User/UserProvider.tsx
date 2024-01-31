import {
  useSnackbar,
  UserContext,
  type LocalUser,
  DEFAULT_USER,
} from '@context';
import { userService } from '@services';
import React from 'react';

type UserProviderProps = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: UserProviderProps) => {
  const { showSnackbar } = useSnackbar();
  const [user, setUser] = React.useState<LocalUser>(DEFAULT_USER);
  const [authenticating, setAuthenticating] = React.useState(false);

  React.useEffect(() => {
    const localUser = localStorage.getItem('user');

    if (!localUser) {
      showSnackbar('Please login to use the calendar', {
        variant: 'solid',
        color: 'neutral',
      });

      return setUser(DEFAULT_USER);
    }

    setUser(JSON.parse(localStorage.getItem('user') as string));
  }, [showSnackbar]);

  const register = async (username: string, password: string) => {
    setAuthenticating(true);

    try {
      await userService.register(username, password);
    } catch (e) {
      if ((e as Error).message === 'Username already exists') {
        return showSnackbar('Username already exists', {
          variant: 'solid',
          color: 'danger',
        });
      }

      showSnackbar('Something went wrong', {
        variant: 'solid',
        color: 'danger',
      });
    } finally {
      setAuthenticating(false);
    }
  };

  const login = async (username: string, password: string) => {
    setAuthenticating(true);
    try {
      const userWithToken = await userService.login(username, password);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      setUser(userWithToken);
    } catch (e) {
      if ((e as Error).message === 'Wrong password') {
        showSnackbar('Wrong password', {
          variant: 'solid',
          color: 'danger',
        });

        throw e;
      }

      if ((e as Error).message === 'Token expired') {
        showSnackbar('You have been logged out', {
          variant: 'solid',
          color: 'danger',
        });

        throw e;
      }

      showSnackbar('Something went wrong', {
        variant: 'solid',
        color: 'danger',
      });

      throw e;
    } finally {
      setAuthenticating(false);
    }
  };

  const logout = (shouldShowSnackbar: boolean = true) => {
    localStorage.removeItem('user');
    setUser(DEFAULT_USER);
    if (shouldShowSnackbar) {
      showSnackbar('You have logged out', {
        variant: 'outlined',
        color: 'neutral',
      });
    }
  };

  const value = React.useMemo(
    () => ({ user, authenticating, register, login, logout }),
    [user, authenticating] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
