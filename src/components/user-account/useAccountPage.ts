import { useSnackbar } from '@context';
import { getUserAccount, updateUserAccount } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { transformClientEntity } from '@utils';
import React, { type ChangeEventHandler } from 'react';

const useAccountPage = () => {
  const user = useUser();
  const { showSnackbar } = useSnackbar();
  const [forbidden, setForbidden] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  React.useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setForbidden(true);
      return;
    }

    setLoading(true);
    setForbidden(false);

    const loadUserProfile = async () => {
      const data = await getUserAccount();

      setEmail(data?.email || user?.email || '');
      setPhoneNumber(data?.phoneNumber || user?.phone || '');
      setName(data?.name);
      setLoading(false);
    };

    void loadUserProfile();
  }, [user, user?.email, user?.phone]);

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
  };

  const handlePhoneNumberChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setPhoneNumber(event.target.value);
  };

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    const serverUpdates = transformClientEntity({
      name,
      email,
      phoneNumber,
      updatedAt: new Date().toISOString(),
    });

    await updateUserAccount(user.id, serverUpdates);

    showSnackbar('Profile updated');

    setLoading(false);
  };

  return {
    loading: loading || !user?.id,
    forbidden,
    email,
    handleEmailChange,
    name,
    handleNameChange,
    phoneNumber,
    handlePhoneNumberChange,
    updateProfile,
  };
};

export default useAccountPage;
