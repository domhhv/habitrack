import { useSnackbar, AuthContext } from '@context';
import { signIn, signOut, signUp } from '@services';
import React from 'react';

type UserProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: UserProviderProps) => {
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

        const signInRes = await signIn(email, password);

        if (signInRes.error) {
          throw signInRes.error;
        }

        showSnackbar('Account created! You can now add your first habit.', {
          variant: 'solid',
          color: 'success',
        });
      } catch (e) {
        showSnackbar((e as Error).message, {
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

        console.log('error:', error);

        if (error) {
          throw error;
        }

        showSnackbar(`Welcome, ${email}!`, {
          variant: 'solid',
          color: 'success',
        });
      } catch (e) {
        console.log('e:', e);
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
      variant: 'solid',
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
