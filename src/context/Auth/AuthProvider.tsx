import { useSnackbar, AuthContext } from '@context';
import { signIn, signOut, signUp } from '@services';
import React from 'react';

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { showSnackbar } = useSnackbar();
  const [authenticating, setAuthenticating] = React.useState(false);

  const register = React.useCallback(
    async (email: string, password: string) => {
      setAuthenticating(true);

      try {
        const signUpRes = await signUp(email, password);

        if (signUpRes.error) {
          throw signUpRes.error;
        }

        showSnackbar(
          'Account created! Please confirm your email before using the app.',
          {
            variant: 'solid',
            color: 'success',
          }
        );
      } catch (e) {
        showSnackbar((e as Error).message || 'Something went wrong', {
          variant: 'solid',
          color: 'danger',
        });
        console.error(e);
      } finally {
        setAuthenticating(false);
      }
    },
    [showSnackbar]
  );

  const login = React.useCallback(
    async (email: string, password: string) => {
      setAuthenticating(true);
      try {
        const { error } = await signIn(email, password);

        if (error) {
          throw error;
        }

        showSnackbar('Welcome back!', {
          variant: 'solid',
          color: 'success',
        });
      } catch (e) {
        const message = (e as Error).message || 'Something went wrong';

        showSnackbar(message, {
          variant: 'solid',
          color: 'danger',
        });

        throw e;
      } finally {
        setAuthenticating(false);
      }
    },
    [showSnackbar]
  );

  const logout = React.useCallback(async () => {
    await signOut();
    showSnackbar('Logged out', {
      variant: 'soft',
      color: 'neutral',
      dismissible: true,
    });
  }, [showSnackbar]);

  const value = React.useMemo(
    () => ({ authenticating, register, login, logout }),
    [authenticating, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
