import { useSnackbar } from '@context';
import {
  getUserAccount,
  updateUserAccount,
  updateUserPassword,
} from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { transformClientEntity } from '@utils';
import React, { type ChangeEventHandler } from 'react';

const useAccountPage = () => {
  const user = useUser();
  const { showSnackbar } = useSnackbar();
  const [forbidden, setForbidden] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    setLoading(true);

    const loadUserProfile = async () => {
      const data = await getUserAccount();

      setEmail(data?.email || user?.email || '');
      setPassword('');
      setName(data?.name || '');
      setLoading(false);
    };

    void loadUserProfile();
  }, [user, user?.email, user?.phone]);

  React.useEffect(() => {
    setForbidden(!user?.id && !loading);
  }, [user, loading]);

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setPassword(event.target.value);
  };

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const updateAccount = async () => {
    if (!user?.id) return;

    setLoading(true);
    const serverUpdates = transformClientEntity({
      name,
      email,
      updatedAt: new Date().toISOString(),
    });

    if (password) {
      await updateUserPassword(password);
    }

    await updateUserAccount(user.id, serverUpdates);

    showSnackbar('Profile updated');

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
