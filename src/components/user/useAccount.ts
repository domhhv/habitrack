import { useSnackbar } from '@context';
import { getUserAccount, updateUserAccount } from '@services';
import { useSession, useUser } from '@supabase/auth-helpers-react';
import React, { type ChangeEventHandler } from 'react';

export const useAccount = () => {
  const user = useUser();
  const session = useSession();
  const { showSnackbar } = useSnackbar();
  const [forbidden, setForbidden] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setForbidden(true);
      return;
    }

    setLoading(true);
    setForbidden(false);

    const loadUserProfile = async () => {
      const [data] = await getUserAccount();
      console.log({ data });
      if (data) {
        setEmail(data.email || session?.user?.email || '');
        setName(data.name);
      }
      setLoading(false);
    };

    void loadUserProfile();
  }, [user]);

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
  };

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    const updates = {
      name,
      email,
      updated_at: new Date().toISOString(),
    };

    await updateUserAccount(user.id, updates);

    showSnackbar('Profile updated');

    setLoading(false);
  };

  return {
    loading,
    forbidden,
    email,
    handleEmailChange,
    name,
    handleNameChange,
    updateProfile,
  };
};
