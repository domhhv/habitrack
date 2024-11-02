import React from 'react';

import { useDataFetch, useTextField } from '@hooks';
import { fetchUser, updateUser } from '@services';
import { useSnackbarsStore } from '@stores';
import { getErrorMessage, toEventLike } from '@utils';

type User = Awaited<ReturnType<typeof fetchUser>>;

const useAccountPage = () => {
  const [user, setUser] = React.useState<User>();
  const { showSnackbar } = useSnackbarsStore();
  const [forbidden, setForbidden] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange] = useTextField();
  const [name, handleNameChange] = useTextField();

  const fillInputs = React.useCallback(
    (user?: User) => {
      handleEmailChange(toEventLike(user?.email));
      handleNameChange(toEventLike(user?.userMetadata.name || ''));
    },
    [handleEmailChange, handleNameChange]
  );

  const loadUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const user = await fetchUser();
      setUser(user);
      fillInputs(user);
    } finally {
      setLoading(false);
    }
  }, [fillInputs]);

  useDataFetch({
    load: loadUser,
    clear: () => {
      fillInputs();
      setForbidden(true);
    },
  });

  React.useEffect(() => {
    void loadUser();
  }, [loadUser]);

  React.useEffect(() => {
    setForbidden(!loading && !user);
  }, [user, loading, fillInputs]);

  const updateAccount = async () => {
    try {
      if (!user) {
        return null;
      }

      setLoading(true);

      const updatedUser = await updateUser(email, password, name);

      setUser(updatedUser);

      showSnackbar('Account updated!', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      showSnackbar(
        'Something went wrong while updating your account. Please try again.',
        {
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
          dismissible: true,
        }
      );

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
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
