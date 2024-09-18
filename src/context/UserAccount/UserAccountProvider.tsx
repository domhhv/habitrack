import { useSnackbar, UserAccountContext } from '@context';
import { signIn, signOut, signUp } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

type UserAccountProviderProps = {
  children: React.ReactNode;
};

const UserAccountProvider = ({ children }: UserAccountProviderProps) => {
  const { showSnackbar } = useSnackbar();
  const [authenticating, setAuthenticating] = React.useState(false);
  const supabaseUser = useUser();

  const register = React.useCallback(
    async (email: string, password: string, name: string) => {
      setAuthenticating(true);

      try {
        const signUpRes = await signUp(email, password, name);

        if (signUpRes.error) {
          throw signUpRes.error;
        }

        showSnackbar('Account created!', {
          color: 'success',
        });
      } catch (e) {
        showSnackbar((e as Error).message || 'Something went wrong', {
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
          color: 'success',
        });
      } catch (e) {
        const message = (e as Error).message || 'Something went wrong';

        showSnackbar(message, {
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
      color: 'default',
      dismissible: true,
    });
  }, [showSnackbar]);

  const value = React.useMemo(
    () => ({ supabaseUser, authenticating, register, login, logout }),
    [supabaseUser, authenticating, register, login, logout]
  );

  return (
    <UserAccountContext.Provider value={value}>
      {children}
    </UserAccountContext.Provider>
  );
};

export default React.memo(UserAccountProvider);
