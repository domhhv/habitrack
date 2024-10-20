import { useSnackbar } from '@context';
import { useTextField } from '@hooks';
import {
  getUserAccountByEmail,
  updateUserAccount,
  updateUserPassword,
} from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

const useAccountPage = () => {
  const user = useUser();
  const { showSnackbar } = useSnackbar();
  const [forbidden, setForbidden] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [email, handleEmailChange, , setEmail] = useTextField();
  const [password, handlePasswordChange, clearPassword] = useTextField();
  const [name, handleNameChange, , setName] = useTextField();

  React.useEffect(() => {
    setLoading(true);

    const loadUserProfile = async () => {
      if (!user?.id) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      const data = await getUserAccountByEmail(user.email || '');

      setEmail(data.email || user.email || '');
      clearPassword();
      setName(data.name || '');
      setLoading(false);
    };

    void loadUserProfile();
  }, [user, user?.email, user?.phone, clearPassword, setEmail, setName]);

  React.useEffect(() => {
    setForbidden(!user?.id && !loading);
  }, [user, loading]);

  const updateAccount = async () => {
    if (!user?.id) return;

    setLoading(true);

    if (email || password) {
      await updateUserPassword(email, password);
    }

    await updateUserAccount(user.id, {
      name,
    });

    showSnackbar('Account updated', { color: 'success' });

    setLoading(false);
  };

  return {
    loading,
    forbidden,
    email,
    handleEmailChange,
    password,
    handlePasswordChange,
    name,
    handleNameChange,
    updateAccount,
  };
};

export default useAccountPage;
