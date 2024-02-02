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

    const parsedLocalUser = JSON.parse(localUser);
    setUser(parsedLocalUser);
  }, [showSnackbar]);

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

  React.useEffect(() => {
    if (user.id && user.accessToken && user.refreshToken) {
      const validateUserTokens = async () =>
        userService.validateTokens(user.accessToken, user.refreshToken);

      validateUserTokens()
        .then(async (res) => {
          let userWithTokens = user;

          if (res.accessTokenExpired) {
            try {
              const newTokens = await userService.regenerateAccessToken(
                user.refreshToken
              );

              if (newTokens.refreshTokenExpired) {
                return logout();
              }

              userWithTokens = { ...userWithTokens, ...newTokens };
            } catch (e) {
              console.log('e: ', e);
              if ((e as Error).message === 'Token expired') {
                return logout();
              }
            }
          }

          localStorage.setItem('user', JSON.stringify(userWithTokens));
          setUser(userWithTokens);
        })
        .catch(async (error) => {
          console.error(error);
        });
    }
  }, [user, logout]);

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
      } else {
        showSnackbar('Something went wrong while registering your account', {
          variant: 'solid',
          color: 'danger',
        });
        console.error(e);
        throw e;
      }
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

      showSnackbar('Something went wrong', {
        variant: 'solid',
        color: 'danger',
      });

      throw e;
    } finally {
      setAuthenticating(false);
    }
  };

  const value = React.useMemo(
    () => ({ user, authenticating, register, login, logout }),
    [user, authenticating] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
